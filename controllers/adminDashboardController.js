const { Op } = require('sequelize');
const sequelize = require('../config/db');
const User = require('../models/user');
const Product = require('../models/product');
const CouponUsage = require('../models/couponUsage');
const Cart = require('../models/cart');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get current date and calculate date ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Initialize default values in case of database connection issues
    let totalUsers = 0, adminCount = 0, vendorCount = 0, regularUserCount = 0;
    let totalProducts = 0, activeProducts = 0, lowStockProducts = 0;
    let todaySales = [{ total_sales: 0, total_orders: 0 }];
    let monthSales = [{ total_sales: 0, total_orders: 0 }];
    let lastMonthSales = [{ total_sales: 0, total_orders: 0 }];
    let totalCarts = 0, activeCarts = 0, checkedOutCarts = 0;
    let recentUsersCount = 0;
    let recentActivity = [];

    try {
      // 1. User Statistics
      totalUsers = await User.count();
      adminCount = await User.count({ where: { role: 'admin' } });
      vendorCount = await User.count({ where: { role: 'vendor' } });
      regularUserCount = await User.count({ where: { role: 'user' } });

      // Recent users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      try {
        recentUsersCount = await User.count({
          where: {
            createdAt: {
              [Op.gte]: thirtyDaysAgo
            }
          }
        });
      } catch (err) {
        // If createdAt field doesn't exist, set to 0
        recentUsersCount = 0;
      }

      // 2. Product Statistics
      totalProducts = await Product.count();
      activeProducts = await Product.count({ where: { is_active: true } });
      lowStockProducts = await Product.count({
        where: {
          stock: {
            [Op.lt]: 10
          }
        }
      });

      // 3. Sales Statistics from CouponUsage (as proxy for orders)
      // Today's sales
      todaySales = await CouponUsage.findAll({
        where: {
          used_at: {
            [Op.gte]: startOfToday
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('order_amount')), 'total_sales'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_orders']
        ],
        raw: true
      });

      // This month's sales
      monthSales = await CouponUsage.findAll({
        where: {
          used_at: {
            [Op.gte]: startOfMonth
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('order_amount')), 'total_sales'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_orders']
        ],
        raw: true
      });

      // Last month's sales for comparison
      lastMonthSales = await CouponUsage.findAll({
        where: {
          used_at: {
            [Op.between]: [startOfLastMonth, endOfLastMonth]
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('order_amount')), 'total_sales'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_orders']
        ],
        raw: true
      });

      // 4. Cart Statistics
      totalCarts = await Cart.count();
      activeCarts = await Cart.count({ where: { status: 0 } }); // active carts
      checkedOutCarts = await Cart.count({ where: { status: 1 } }); // checked out carts

    } catch (dbError) {
      console.warn('Database connection issue, using default values:', dbError.message);
      // Default values are already set above
    }

    // Calculate growth percentages
    const currentMonthSales = parseFloat(monthSales[0]?.total_sales || 0);
    const lastMonthSalesAmount = parseFloat(lastMonthSales[0]?.total_sales || 0);
    
    let salesGrowthPercentage = 0;
    if (lastMonthSalesAmount > 0) {
      salesGrowthPercentage = ((currentMonthSales - lastMonthSalesAmount) / lastMonthSalesAmount) * 100;
    } else if (currentMonthSales > 0) {
      salesGrowthPercentage = 100; // 100% growth if no previous sales
    }

    // 5. Recent Activity (last 7 days) - only if database is available
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      recentActivity = await CouponUsage.findAll({
        where: {
          used_at: {
            [Op.gte]: sevenDaysAgo
          }
        },
        attributes: [
          [sequelize.fn('DATE', sequelize.col('used_at')), 'date'],
          [sequelize.fn('SUM', sequelize.col('order_amount')), 'daily_sales'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'daily_orders']
        ],
        group: [sequelize.fn('DATE', sequelize.col('used_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('used_at')), 'ASC']],
        raw: true
      });
    } catch (activityError) {
      console.warn('Could not fetch recent activity:', activityError.message);
      recentActivity = [];
    }

    // Format the response
    const dashboardData = {
      users: {
        total: totalUsers,
        admins: adminCount,
        vendors: vendorCount,
        customers: regularUserCount,
        recent: recentUsersCount
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts
      },
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
      carts: {
        total: totalCarts,
        active: activeCarts,
        checkedOut: checkedOutCarts
      },
      recentActivity: recentActivity
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDashboardStats
};
