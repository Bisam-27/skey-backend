const User = require('../models/user');
const { Op } = require('sequelize');

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

module.exports = {
  getAllUsers,
  getUserById,
  getUserStats
};
