const User = require('../models/user');
const Wishlist = require('../models/wishlist');
const Cart = require('../models/cart');
const Product = require('../models/product');
const { Op } = require('sequelize');

// Import associations to ensure they are loaded
require('../models/associations');

// Helper function to get the best available product image
const getBestProductImage = (product) => {
  // Priority order: image_1_url > img_url > image_2_url > image_3_url > img_4_url > thumbnails
  const imageFields = [
    'image_1_url',
    'img_url',
    'image_2_url',
    'image_3_url',
    'img_4_url',
    'image_1_thumbnail',
    'image_2_thumbnail',
    'image_3_thumbnail'
  ];

  for (const field of imageFields) {
    if (product[field] && product[field].trim() !== '') {
      return product[field];
    }
  }

  // Return placeholder if no image found
  return '/placeholder.jpg';
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = '', 
      sortBy = 'id', 
      sortOrder = 'ASC' 
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 users per page
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const whereClause = {};
    
    // Search by email
    if (search) {
      whereClause.email = {
        [Op.like]: `%${search}%`
      };
    }

    // Filter by role
    if (role && ['user', 'admin'].includes(role)) {
      whereClause.role = role;
    }

    // Validate sort parameters
    const validSortFields = ['id', 'email', 'role'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'id';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'email', 'role'], // Exclude password
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers: count,
          usersPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching users'
    });
  }
};

// Get specific user by ID (Admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate user ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    // Find user by ID
    const user = await User.findByPk(parseInt(id), {
      attributes: ['id', 'email', 'role'] // Exclude password
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user'
    });
  }
};

// Get user statistics (Admin only)
const getUserStats = async (req, res) => {
  try {
    // Get total user count
    const totalUsers = await User.count();

    // Get user count by role
    const adminCount = await User.count({ where: { role: 'admin' } });
    const regularUserCount = await User.count({ where: { role: 'user' } });

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Note: This assumes you have created_at field. If not, this will be 0
    let recentUsersCount = 0;
    try {
      recentUsersCount = await User.count({
        where: {
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });
    } catch (err) {
      // If createdAt field doesn't exist, just set to 0
      recentUsersCount = 0;
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        adminCount,
        regularUserCount,
        recentUsersCount: recentUsersCount
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user statistics'
    });
  }
};

// Get user's wishlist (Admin only)
const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate user ID
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    // Check if user exists
    const user = await User.findByPk(parseInt(userId));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Get user's wishlist items first
    const { count, rows: wishlistItems } = await Wishlist.findAndCountAll({
      where: { user_id: parseInt(userId) },
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    // Manually fetch product details for each wishlist item
    const wishlistWithProducts = await Promise.all(
      wishlistItems.map(async (item) => {
        try {
          const product = await Product.findByPk(item.product_id, {
            attributes: [
              'id',
              'name',
              'price',
              'stock',
              'discount',
              'description',
              'image_1_url',
              'image_2_url',
              'image_3_url',
              'img_url',
              'img_4_url',
              'image_1_thumbnail',
              'image_2_thumbnail',
              'image_3_thumbnail'
            ]
          });

          if (product) {
            const productData = product.toJSON();
            // Add a helper field for the best available image
            productData.primary_image = getBestProductImage(productData);

            return {
              ...item.toJSON(),
              product: productData
            };
          } else {
            return {
              ...item.toJSON(),
              product: null
            };
          }
        } catch (error) {
          console.error('Error fetching product for wishlist item:', error);
          return {
            ...item.toJSON(),
            product: null
          };
        }
      })
    );

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        wishlist: wishlistWithProducts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user wishlist'
    });
  }
};

// Get user's order history (Admin only) - Using Cart as proxy for orders
const getUserOrderHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate user ID
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    // Check if user exists
    const user = await User.findByPk(parseInt(userId));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Get user's cart history (orders) - Cart contains invoice_items with product details
    const { count, rows: orders } = await Cart.findAndCountAll({
      where: { user_id: parseInt(userId) },
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    // Calculate order statistics using final amounts (including coupon discounts and delivery fees)
    const totalOrders = count;
    const totalSpent = orders.reduce((sum, order) => {
      // Calculate final amount: subtotal - coupon_discount + delivery_fee
      const subtotal = parseFloat(order.total_amount) || 0;
      const couponDiscount = parseFloat(order.discount_amount) || 0;
      const deliveryFee = parseFloat(order.delivery_fee) || 0;
      const finalAmount = subtotal - couponDiscount + deliveryFee;

      return sum + finalAmount;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        orders,
        statistics: {
          totalOrders,
          totalSpent: totalSpent.toFixed(2)
        },
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user order history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user order history'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserStats,
  getUserWishlist,
  getUserOrderHistory
};
