const { Coupon, CouponUsage, Product, Category } = require('../models/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// Apply coupon to an order (to be called during checkout)
const applyCouponToOrder = async (couponCode, userId, orderAmount, productIds = [], orderId = null) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Find and validate coupon
    const coupon = await Coupon.findOne({
      where: {
        code: couponCode.toUpperCase(),
        is_active: true
      },
      include: [
        {
          model: Product,
          as: 'product'
        },
        {
          model: Category,
          as: 'collection'
        }
      ],
      transaction
    });

    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    // Check if coupon can be used
    if (!coupon.canBeUsed()) {
      let message = 'Coupon cannot be used';
      if (coupon.isExpired()) {
        message = 'Coupon has expired';
      } else if (coupon.isUsageLimitReached()) {
        message = 'Coupon usage limit reached';
      }
      throw new Error(message);
    }

    // Check minimum order amount
    if (coupon.minimum_order_amount && orderAmount < coupon.minimum_order_amount) {
      throw new Error(`Minimum order amount of ₹${coupon.minimum_order_amount} required`);
    }

    // For product-specific coupons, check if the product is in the order
    if (coupon.product_type === 'product' && productIds.length > 0) {
      if (!productIds.includes(coupon.product_id)) {
        throw new Error('This coupon is only valid for specific products');
      }
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount);

    if (discountAmount <= 0) {
      throw new Error('No discount applicable');
    }

    // Record coupon usage
    const couponUsage = await CouponUsage.create({
      coupon_id: coupon.id,
      user_id: userId,
      order_id: orderId,
      discount_amount: discountAmount,
      order_amount: orderAmount
    }, { transaction });

    // Update coupon used count
    await coupon.increment('used_count', { transaction });

    await transaction.commit();

    return {
      success: true,
      coupon_id: coupon.id,
      code: coupon.code,
      discount_amount: discountAmount,
      final_amount: orderAmount - discountAmount,
      usage_id: couponUsage.id
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Get coupon usage history for a vendor
const getVendorCouponUsage = async (req, res) => {
  try {
    const { page = 1, limit = 20, coupon_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for coupons
    const couponWhere = { vendor_id: req.userId };
    if (coupon_id) {
      couponWhere.id = coupon_id;
    }

    // Build where clause for usage
    const usageWhere = {};
    if (start_date) {
      usageWhere.used_at = { [Op.gte]: new Date(start_date) };
    }
    if (end_date) {
      usageWhere.used_at = {
        ...usageWhere.used_at,
        [Op.lte]: new Date(end_date)
      };
    }

    const { count, rows: usageHistory } = await CouponUsage.findAndCountAll({
      include: [
        {
          model: Coupon,
          as: 'coupon',
          where: couponWhere,
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name']
            },
            {
              model: Category,
              as: 'collection',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email']
        }
      ],
      where: usageWhere,
      order: [['used_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate summary statistics
    const summaryStats = await CouponUsage.findAll({
      include: [
        {
          model: Coupon,
          as: 'coupon',
          where: couponWhere,
          attributes: []
        }
      ],
      where: usageWhere,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('CouponUsage.id')), 'total_uses'],
        [sequelize.fn('SUM', sequelize.col('CouponUsage.discount_amount')), 'total_discount_given'],
        [sequelize.fn('SUM', sequelize.col('CouponUsage.order_amount')), 'total_order_value'],
        [sequelize.fn('AVG', sequelize.col('CouponUsage.discount_amount')), 'avg_discount'],
        [sequelize.fn('AVG', sequelize.col('CouponUsage.order_amount')), 'avg_order_value']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        usage_history: usageHistory,
        summary: summaryStats[0] || {
          total_uses: 0,
          total_discount_given: 0,
          total_order_value: 0,
          avg_discount: 0,
          avg_order_value: 0
        },
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get vendor coupon usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get coupon analytics for vendor dashboard
const getCouponAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get coupon performance data
    const analytics = await CouponUsage.findAll({
      include: [
        {
          model: Coupon,
          as: 'coupon',
          where: { vendor_id: req.userId },
          attributes: ['id', 'code', 'coupon_type', 'discount_value']
        }
      ],
      where: {
        used_at: { [Op.gte]: startDate }
      },
      attributes: [
        'coupon_id',
        [sequelize.fn('COUNT', sequelize.col('CouponUsage.id')), 'usage_count'],
        [sequelize.fn('SUM', sequelize.col('CouponUsage.discount_amount')), 'total_discount'],
        [sequelize.fn('SUM', sequelize.col('CouponUsage.order_amount')), 'total_revenue'],
        [sequelize.fn('AVG', sequelize.col('CouponUsage.order_amount')), 'avg_order_value']
      ],
      group: ['coupon_id', 'coupon.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('CouponUsage.id')), 'DESC']]
    });

    // Get overall statistics
    const overallStats = await CouponUsage.findAll({
      include: [
        {
          model: Coupon,
          as: 'coupon',
          where: { vendor_id: req.userId },
          attributes: []
        }
      ],
      where: {
        used_at: { [Op.gte]: startDate }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('CouponUsage.id')), 'total_uses'],
        [sequelize.fn('SUM', sequelize.col('CouponUsage.discount_amount')), 'total_discount_given'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('CouponUsage.user_id'))), 'unique_customers'],
        [sequelize.fn('SUM', sequelize.col('CouponUsage.order_amount')), 'total_influenced_revenue']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        period_days: parseInt(period),
        coupon_performance: analytics,
        overall_stats: overallStats[0] || {
          total_uses: 0,
          total_discount_given: 0,
          unique_customers: 0,
          total_influenced_revenue: 0
        }
      }
    });

  } catch (error) {
    console.error('Get coupon analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  applyCouponToOrder,
  getVendorCouponUsage,
  getCouponAnalytics
};
