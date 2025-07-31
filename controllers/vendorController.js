const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

// Register new vendor
const registerVendor = async (req, res) => {
  try {
    const { email, password, confirmPassword, businessName, contactNumber } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and confirm password'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new vendor
    const vendor = await User.create({
      email,
      password,
      role: 'vendor'
    });

    // Generate token
    const token = generateToken(vendor.id);

    // Return success response (don't send password)
    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully',
      data: {
        vendor: {
          id: vendor.id,
          email: vendor.email,
          role: vendor.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during vendor registration'
    });
  }
};

// Vendor login
const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find vendor by email
    const vendor = await User.findByEmail(email);
    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is a vendor
    if (!vendor.isVendor()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor account required.'
      });
    }

    // Check password
    if (!vendor.comparePassword(password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(vendor.id);

    res.json({
      success: true,
      message: 'Vendor login successful',
      data: {
        vendor: {
          id: vendor.id,
          email: vendor.email,
          role: vendor.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Get vendor profile
const getVendorProfile = async (req, res) => {
  try {
    const vendor = req.user;

    res.json({
      success: true,
      message: 'Vendor profile retrieved successfully',
      data: {
        vendor: {
          id: vendor.id,
          email: vendor.email,
          role: vendor.role
        }
      }
    });

  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update vendor profile
const updateVendorProfile = async (req, res) => {
  try {
    const vendor = req.user;
    const { email, currentPassword, newPassword } = req.body;

    const updateData = {};

    // Update email if provided
    if (email && email !== vendor.email) {
      // Check if new email already exists
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: vendor.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      updateData.email = email;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set new password'
        });
      }

      if (!vendor.comparePassword(currentPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      updateData.password = newPassword;
    }

    // Update vendor
    await vendor.update(updateData);

    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: {
        vendor: {
          id: vendor.id,
          email: vendor.email,
          role: vendor.role
        }
      }
    });

  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get vendor statistics
const getVendorStats = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const Product = require('../models/product');

    // Get product count for this vendor
    const productCount = await Product.count({
      where: { vendor_id: vendorId }
    });

    // Get products with stock information
    const products = await Product.findAll({
      where: { vendor_id: vendorId },
      attributes: ['id', 'name', 'stock', 'price']
    });

    const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
    const lowStockProducts = products.filter(product => (product.stock || 0) < 10).length;

    res.json({
      success: true,
      message: 'Vendor statistics retrieved successfully',
      data: {
        stats: {
          totalProducts: productCount,
          totalStock,
          lowStockProducts,
          recentProducts: products.slice(0, 5)
        }
      }
    });

  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  registerVendor,
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorStats
};
