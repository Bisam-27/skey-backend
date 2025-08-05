const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to orders table'
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to product table'
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Product name at time of order (for historical record)'
  },
  product_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Product image URL at time of order'
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Vendor ID for multi-vendor support'
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Product SKU'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Quantity ordered'
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Price per unit at time of order'
  },
  discount_per_item: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Discount applied per item'
  },
  final_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Final price per unit after discount'
  },
  line_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Total for this line item (quantity * final_price)'
  },
  product_attributes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Product attributes like size, color, etc.'
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
  tableName: 'order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['order_id']
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['vendor_id']
    }
  ]
});

module.exports = OrderItem;
