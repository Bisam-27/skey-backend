const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Return = sequelize.define('Return', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  return_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    comment: 'Unique return number for tracking'
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to the original order'
  },
  order_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to the specific order item being returned'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User who initiated the return'
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Vendor who needs to process the return'
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Product being returned'
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Product name at time of return (for historical record)'
  },
  product_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Product image URL'
  },
  quantity_returned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Quantity being returned'
  },
  return_reason: {
    type: DataTypes.ENUM('defective', 'wrong_item', 'not_as_described', 'damaged_in_shipping', 'changed_mind', 'other'),
    allowNull: false,
    comment: 'Reason for return'
  },
  return_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detailed description of the return reason'
  },
  return_status: {
    type: DataTypes.ENUM('requested', 'approved', 'rejected', 'received', 'processed', 'refunded'),
    allowNull: false,
    defaultValue: 'requested',
    comment: 'Current status of the return'
  },
  fulfillment_status: {
    type: DataTypes.ENUM('unfulfilled', 'fulfilled'),
    allowNull: false,
    defaultValue: 'unfulfilled',
    comment: 'Vendor fulfillment status for return management'
  },
  refund_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Amount to be refunded'
  },
  refund_method: {
    type: DataTypes.ENUM('original_payment', 'store_credit', 'bank_transfer'),
    allowNull: true,
    comment: 'Method of refund'
  },
  vendor_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Internal notes from vendor'
  },
  customer_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes from customer'
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when return was approved'
  },
  received_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when returned item was received'
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when return was processed'
  },
  refunded_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when refund was issued'
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
  tableName: 'returns',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['return_number']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['vendor_id']
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['return_status']
    },
    {
      fields: ['fulfillment_status']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Instance methods
Return.prototype.generateReturnNumber = function() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RET${timestamp.slice(-6)}${random}`;
};

Return.prototype.canBeApproved = function() {
  return this.return_status === 'requested';
};

Return.prototype.canBeRejected = function() {
  return this.return_status === 'requested';
};

Return.prototype.canBeReceived = function() {
  return this.return_status === 'approved';
};

Return.prototype.canBeProcessed = function() {
  return this.return_status === 'received';
};

Return.prototype.canBeRefunded = function() {
  return this.return_status === 'processed';
};

module.exports = Return;
