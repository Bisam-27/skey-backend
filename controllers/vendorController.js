// Import models with associations
require('../models/associations');
const User = require('../models/user');
const VendorProfile = require('../models/vendorProfile');
const Product = require('../models/product');
const Subcategory = require('../models/subcategory');
const Category = require('../models/category');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

// Register new vendor
const registerVendor = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      email,
      password,
      confirmPassword,
      businessName,
      contactName,
      mobileNumber,
      gstNumber,
      businessAddress,
      bankName,
      panNumber
    } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and confirm password'
      });
    }

    if (!businessName || !contactName || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide business name, contact name, and mobile number'
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

    // Create new vendor user
    const vendor = await User.create({
      email,
      password,
      role: 'vendor'
    }, { transaction });

    // Create vendor profile
    const vendorProfile = await VendorProfile.create({
      user_id: vendor.id,
      business_name: businessName,
      contact_name: contactName,
      mobile_number: mobileNumber,
      gst_number: gstNumber || null,
      business_address: businessAddress || null,
      bank_name: bankName || null,
      pan_number: panNumber || null,
      is_verified: false
    }, { transaction });

    // Commit transaction
    await transaction.commit();

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
          role: vendor.role,
          profile: {
            business_name: vendorProfile.business_name,
            contact_name: vendorProfile.contact_name,
            mobile_number: vendorProfile.mobile_number,
            is_verified: vendorProfile.is_verified
          }
        },
        token
      }
    });

  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();

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

    // Get vendor profile data
    const vendorProfile = await VendorProfile.findOne({
      where: { user_id: vendor.id }
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor profile retrieved successfully',
      data: {
        vendor: {
          id: vendor.id,
          email: vendor.email,
          role: vendor.role,
          profile: {
            business_name: vendorProfile.business_name,
            contact_name: vendorProfile.contact_name,
            mobile_number: vendorProfile.mobile_number,
            gst_number: vendorProfile.gst_number,
            business_address: vendorProfile.business_address,
            bank_name: vendorProfile.bank_name,
            pan_number: vendorProfile.pan_number,
            business_license_url: vendorProfile.business_license_url,
            gst_certificate_url: vendorProfile.gst_certificate_url,
            cancelled_cheque_url: vendorProfile.cancelled_cheque_url,
            is_verified: vendorProfile.is_verified,
            verification_notes: vendorProfile.verification_notes,
            created_at: vendorProfile.created_at,
            updated_at: vendorProfile.updated_at
          }
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
  const transaction = await sequelize.transaction();

  try {
    const vendor = req.user;
    const {
      email,
      currentPassword,
      newPassword,
      businessName,
      contactName,
      mobileNumber,
      gstNumber,
      businessAddress,
      bankName,
      panNumber
    } = req.body;

    const userUpdateData = {};
    const profileUpdateData = {};

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

      userUpdateData.email = email;
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

      userUpdateData.password = newPassword;
    }

    // Update profile fields if provided
    if (businessName) profileUpdateData.business_name = businessName;
    if (contactName) profileUpdateData.contact_name = contactName;
    if (mobileNumber) profileUpdateData.mobile_number = mobileNumber;
    if (gstNumber !== undefined) profileUpdateData.gst_number = gstNumber;
    if (businessAddress !== undefined) profileUpdateData.business_address = businessAddress;
    if (bankName !== undefined) profileUpdateData.bank_name = bankName;
    if (panNumber !== undefined) profileUpdateData.pan_number = panNumber;

    // Update user data if there are changes
    if (Object.keys(userUpdateData).length > 0) {
      await vendor.update(userUpdateData, { transaction });
    }

    // Update vendor profile if there are changes
    if (Object.keys(profileUpdateData).length > 0) {
      await VendorProfile.update(profileUpdateData, {
        where: { user_id: vendor.id },
        transaction
      });
    }

    // Get updated vendor profile
    const updatedProfile = await VendorProfile.findOne({
      where: { user_id: vendor.id },
      transaction
    });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: {
        vendor: {
          id: vendor.id,
          email: userUpdateData.email || vendor.email,
          role: vendor.role,
          profile: {
            business_name: updatedProfile.business_name,
            contact_name: updatedProfile.contact_name,
            mobile_number: updatedProfile.mobile_number,
            gst_number: updatedProfile.gst_number,
            business_address: updatedProfile.business_address,
            bank_name: updatedProfile.bank_name,
            pan_number: updatedProfile.pan_number,
            business_license_url: updatedProfile.business_license_url,
            gst_certificate_url: updatedProfile.gst_certificate_url,
            cancelled_cheque_url: updatedProfile.cancelled_cheque_url,
            is_verified: updatedProfile.is_verified
          }
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
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

    // Get current date ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get product statistics for this vendor
    const productCount = await Product.count({
      where: { vendor_id: vendorId }
    });

    const products = await Product.findAll({
      where: { vendor_id: vendorId },
      attributes: ['id', 'name', 'stock', 'price', 'discount', 'image_1_url', 'img_url', 'image_2_url', 'image_3_url'],
      include: [{
        model: Subcategory,
        as: 'subcategory',
        attributes: ['id', 'name'],
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }]
      }]
    });

    const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
    const lowStockProducts = products.filter(product => (product.stock || 0) < 10).length;

    // Get sales statistics from order_items for this vendor
    const todaySales = await OrderItem.findAll({
      include: [{
        model: Order,
        as: 'order',
        where: {
          created_at: { [Op.gte]: startOfToday },
          order_status: { [Op.notIn]: ['cancelled'] }
        },
        attributes: []
      }],
      where: { vendor_id: vendorId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('line_total')), 'total_sales'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('order.id'))), 'total_orders']
      ],
      raw: true
    });

    const monthSales = await OrderItem.findAll({
      include: [{
        model: Order,
        as: 'order',
        where: {
          created_at: { [Op.gte]: startOfMonth },
          order_status: { [Op.notIn]: ['cancelled'] }
        },
        attributes: []
      }],
      where: { vendor_id: vendorId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('line_total')), 'total_sales'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('order.id'))), 'total_orders']
      ],
      raw: true
    });

    const lastMonthSales = await OrderItem.findAll({
      include: [{
        model: Order,
        as: 'order',
        where: {
          created_at: {
            [Op.gte]: startOfLastMonth,
            [Op.lte]: endOfLastMonth
          },
          order_status: { [Op.notIn]: ['cancelled'] }
        },
        attributes: []
      }],
      where: { vendor_id: vendorId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('line_total')), 'total_sales'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('order.id'))), 'total_orders']
      ],
      raw: true
    });

    // Calculate growth percentage
    const currentMonthSales = parseFloat(monthSales[0]?.total_sales || 0);
    const lastMonthSalesAmount = parseFloat(lastMonthSales[0]?.total_sales || 0);
    const salesGrowthPercentage = lastMonthSalesAmount > 0
      ? ((currentMonthSales - lastMonthSalesAmount) / lastMonthSalesAmount) * 100
      : 0;

    // Get recent orders for this vendor
    const recentOrders = await Order.findAll({
      include: [{
        model: OrderItem,
        as: 'items',
        where: { vendor_id: vendorId },
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image_1_url', 'img_url']
        }]
      }],
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'order_number', 'total_amount', 'order_status', 'created_at']
    });

    res.json({
      success: true,
      message: 'Vendor statistics retrieved successfully',
      data: {
        stats: {
          // Product statistics
          totalProducts: productCount,
          totalStock,
          lowStockProducts,

          // Sales statistics
          sales: {
            today: {
              amount: parseFloat(todaySales[0]?.total_sales || 0),
              orders: parseInt(todaySales[0]?.total_orders || 0)
            },
            thisMonth: {
              amount: currentMonthSales,
              orders: parseInt(monthSales[0]?.total_orders || 0),
              growthPercentage: Math.round(salesGrowthPercentage * 100) / 100
            },
            lastMonth: {
              amount: lastMonthSalesAmount,
              orders: parseInt(lastMonthSales[0]?.total_orders || 0)
            }
          },

          // Recent data
          recentProducts: products.slice(0, 5),
          recentOrders: recentOrders
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

// Upload vendor document
const uploadVendorDocument = async (req, res) => {
  try {
    const vendor = req.user;
    const documentType = req.params.documentType;

    // Validate document type
    const allowedTypes = ['business_license', 'gst_certificate', 'cancelled_cheque'];
    if (!allowedTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get vendor profile
    const vendorProfile = await VendorProfile.findOne({
      where: { user_id: vendor.id }
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Update the appropriate document URL field
    const updateData = {};
    const documentUrl = `${req.protocol}://${req.get('host')}/uploads/vendor-documents/${req.file.filename}`;

    switch (documentType) {
      case 'business_license':
        updateData.business_license_url = documentUrl;
        break;
      case 'gst_certificate':
        updateData.gst_certificate_url = documentUrl;
        break;
      case 'cancelled_cheque':
        updateData.cancelled_cheque_url = documentUrl;
        break;
    }

    // Update vendor profile
    await vendorProfile.update(updateData);

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        documentType: documentType,
        documentUrl: documentUrl,
        filename: req.file.filename
      }
    });

  } catch (error) {
    console.error('Upload document error:', error);
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
  getVendorStats,
  uploadVendorDocument
};
