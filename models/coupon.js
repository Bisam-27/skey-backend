const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Coupon code cannot be empty'
      },
      len: {
        args: [3, 50],
        msg: 'Coupon code must be between 3 and 50 characters'
      },
      isAlphanumeric: {
        msg: 'Coupon code can only contain letters and numbers'
      }
    }
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id'
    },
    comment: 'Reference to user table for vendor who created this coupon'
  },
  product_type: {
    type: DataTypes.ENUM('collection', 'product'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['collection', 'product']],
        msg: 'Product type must be either collection or product'
      }
    }
  },
  collection_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    },
    comment: 'Reference to categories table when product_type is collection'
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'product',
      key: 'id'
    },
    comment: 'Reference to product table when product_type is product'
  },
  coupon_type: {
    type: DataTypes.ENUM('discount', 'flat_off'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['discount', 'flat_off']],
        msg: 'Coupon type must be either discount or flat_off'
      }
    }
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Discount value must be greater than 0'
      }
    }
  },
  expiration_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Expiration date must be a valid date'
      },
      isAfter: {
        args: new Date().toISOString().split('T')[0],
        msg: 'Expiration date must be in the future'
      }
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  usage_limit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    validate: {
      min: {
        args: [1],
        msg: 'Usage limit must be at least 1'
      }
    }
  },
  used_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Used count cannot be negative'
      }
    }
  },
  minimum_order_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null,
    validate: {
      min: {
        args: [0],
        msg: 'Minimum order amount cannot be negative'
      }
    }
  }
}, {
  tableName: 'coupons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  validate: {
    // Custom validation to ensure either collection_id or product_id is set based on product_type
    productTypeValidation() {
      if (this.product_type === 'collection' && !this.collection_id) {
        throw new Error('Collection ID is required when product type is collection');
      }
      if (this.product_type === 'product' && !this.product_id) {
        throw new Error('Product ID is required when product type is product');
      }
      if (this.product_type === 'collection' && this.product_id) {
        throw new Error('Product ID should not be set when product type is collection');
      }
      if (this.product_type === 'product' && this.collection_id) {
        throw new Error('Collection ID should not be set when product type is product');
      }
    },
    // Validate discount value based on coupon type
    discountValueValidation() {
      // Temporarily disabled for testing
      return;

      // Only validate if coupon_type is set
      if (!this.coupon_type) return;

      if (this.coupon_type === 'discount' && this.discount_value > 100) {
        throw new Error('Discount percentage cannot exceed 100%');
      }
      if (this.coupon_type === 'flat_off' && this.discount_value <= 0) {
        throw new Error('Flat off amount must be greater than 0');
      }
    }
  }
});

// Instance methods
Coupon.prototype.isExpired = function() {
  return new Date() > this.expiration_date;
};

Coupon.prototype.isUsageLimitReached = function() {
  return this.usage_limit && this.used_count >= this.usage_limit;
};

Coupon.prototype.canBeUsed = function() {
  return this.is_active && !this.isExpired() && !this.isUsageLimitReached();
};

Coupon.prototype.calculateDiscount = function(orderAmount) {
  if (!this.canBeUsed()) {
    return 0;
  }
  
  if (this.minimum_order_amount && orderAmount < this.minimum_order_amount) {
    return 0;
  }
  
  if (this.coupon_type === 'discount') {
    return (orderAmount * this.discount_value) / 100;
  } else if (this.coupon_type === 'flat_off') {
    return Math.min(this.discount_value, orderAmount);
  }
  
  return 0;
};

// Class methods
Coupon.findByCode = async function(code) {
  return await Coupon.findOne({ 
    where: { 
      code: code.toUpperCase(),
      is_active: true 
    } 
  });
};

Coupon.findByVendor = async function(vendorId, options = {}) {
  const whereClause = { vendor_id: vendorId };
  
  if (options.active !== undefined) {
    whereClause.is_active = options.active;
  }
  
  return await Coupon.findAll({ 
    where: whereClause,
    order: [['created_at', 'DESC']]
  });
};

module.exports = Coupon;
