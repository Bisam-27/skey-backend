const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CouponUsage = sequelize.define('CouponUsage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  coupon_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'coupons',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id'
    }
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Reference to order table when implemented'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Discount amount cannot be negative'
      }
    }
  },
  order_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Order amount cannot be negative'
      }
    }
  },
  used_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'coupon_usage',
  timestamps: false,
  indexes: [
    {
      unique: false,
      fields: ['coupon_id']
    },
    {
      unique: false,
      fields: ['user_id']
    },
    {
      unique: false,
      fields: ['used_at']
    }
  ]
});

// Class methods
CouponUsage.findByCoupon = async function(couponId, options = {}) {
  const whereClause = { coupon_id: couponId };
  
  if (options.userId) {
    whereClause.user_id = options.userId;
  }
  
  if (options.startDate) {
    whereClause.used_at = {
      ...whereClause.used_at,
      [sequelize.Op.gte]: options.startDate
    };
  }
  
  if (options.endDate) {
    whereClause.used_at = {
      ...whereClause.used_at,
      [sequelize.Op.lte]: options.endDate
    };
  }
  
  return await CouponUsage.findAll({
    where: whereClause,
    order: [['used_at', 'DESC']],
    limit: options.limit || null
  });
};

CouponUsage.getUsageStats = async function(couponId) {
  const stats = await CouponUsage.findAll({
    where: { coupon_id: couponId },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total_uses'],
      [sequelize.fn('SUM', sequelize.col('discount_amount')), 'total_discount_given'],
      [sequelize.fn('SUM', sequelize.col('order_amount')), 'total_order_value'],
      [sequelize.fn('AVG', sequelize.col('discount_amount')), 'avg_discount'],
      [sequelize.fn('AVG', sequelize.col('order_amount')), 'avg_order_value']
    ],
    raw: true
  });
  
  return stats[0] || {
    total_uses: 0,
    total_discount_given: 0,
    total_order_value: 0,
    avg_discount: 0,
    avg_order_value: 0
  };
};

module.exports = CouponUsage;
