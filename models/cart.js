const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  invoice_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Unique invoice identifier for the cart'
  },
  invoice_items: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string containing cart items details',
    get() {
      const rawValue = this.getDataValue('invoice_items');
      if (!rawValue || rawValue === 'null' || rawValue === '') {
        return [];
      }
      try {
        return JSON.parse(rawValue);
      } catch (error) {
        console.error('Error parsing invoice_items JSON:', error);
        return [];
      }
    },
    set(value) {
      this.setDataValue('invoice_items', JSON.stringify(value));
    }
  },

  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'Customer email address'
  },
  phone: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Customer phone number'
  },
  status: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 0,
    comment: 'Cart status: 0=active, 1=checked_out, 2=abandoned'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Reference to user table for authenticated users'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    comment: 'Total cart amount'
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
  tableName: 'cart',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeUpdate: (cart) => {
      cart.updated_at = new Date();
    }
  }
});

// Instance methods
Cart.prototype.addItem = function(productId, productName, price, quantity = 1, productImage = null) {
  const items = this.invoice_items || [];
  const existingItemIndex = items.findIndex(item => item.product_id === productId);
  
  if (existingItemIndex > -1) {
    // Update existing item quantity
    items[existingItemIndex].quantity += quantity;
    items[existingItemIndex].subtotal = items[existingItemIndex].quantity * items[existingItemIndex].price;
  } else {
    // Add new item
    items.push({
      product_id: productId,
      product_name: productName,
      price: parseFloat(price),
      quantity: quantity,
      subtotal: parseFloat(price) * quantity,
      product_image: productImage || null,
      added_at: new Date()
    });
  }
  
  this.invoice_items = items;
  this.calculateTotal();
  return this;
};

Cart.prototype.removeItem = function(productId) {
  const items = this.invoice_items || [];
  const filteredItems = items.filter(item => item.product_id !== productId);
  this.invoice_items = filteredItems;
  this.calculateTotal();
  return this;
};

Cart.prototype.updateItemQuantity = function(productId, quantity) {
  const items = this.invoice_items || [];
  const itemIndex = items.findIndex(item => item.product_id === productId);
  
  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      items.splice(itemIndex, 1);
    } else {
      items[itemIndex].quantity = quantity;
      items[itemIndex].subtotal = items[itemIndex].quantity * items[itemIndex].price;
    }
    this.invoice_items = items;
    this.calculateTotal();
  }
  return this;
};

Cart.prototype.calculateTotal = function() {
  const items = this.invoice_items || [];
  const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  this.total_amount = parseFloat(total.toFixed(2));
  return this.total_amount;
};

Cart.prototype.getItemCount = function() {
  const items = this.invoice_items || [];
  return items.reduce((count, item) => count + item.quantity, 0);
};

Cart.prototype.isEmpty = function() {
  const items = this.invoice_items || [];
  return items.length === 0;
};

// Class methods
Cart.findByUserId = async function(userId) {
  return await Cart.findOne({ 
    where: { 
      user_id: userId, 
      status: 0 // Active cart
    } 
  });
};

Cart.findOrCreateForUser = async function(userId, userEmail = null) {
  let cart = await Cart.findByUserId(userId);

  if (!cart) {
    cart = await Cart.create({
      user_id: userId,
      email: userEmail,
      status: 0,
      invoice_items: [],
      total_amount: 0.00
    });
  }

  return cart;
};

module.exports = Cart;
