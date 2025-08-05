const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    comment: 'Unique order number for tracking'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User ID if registered user, null for guest orders'
  },
  customer_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Customer email address'
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Customer phone number'
  },
  customer_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Customer name from checkout'
  },
  shipping_address: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Complete shipping address as JSON'
  },
  billing_address: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Billing address if different from shipping'
  },
  order_items: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array of ordered items with product details, quantities, prices'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Subtotal before discounts and fees'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total discount applied'
  },
  coupon_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Applied coupon code'
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Delivery/shipping fee'
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Tax amount'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Final total amount'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Payment method used'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Payment status'
  },
  order_status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Order fulfillment status'
  },
  fulfillment_status: {
    type: DataTypes.ENUM('unfulfilled', 'fulfilled'),
    allowNull: false,
    defaultValue: 'unfulfilled',
    comment: 'Admin fulfillment status for order management'
  },
  order_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Special instructions or notes'
  },
  tracking_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Shipping tracking number'
  },
  shipped_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when order was shipped'
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when order was delivered'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when order was cancelled'
  },
  cancelled_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for cancellation'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['order_number']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['customer_email']
    },
    {
      fields: ['order_status']
    },
    {
      fields: ['fulfillment_status']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Order;
