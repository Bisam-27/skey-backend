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
    comment: 'Cart status: 0=active, 1=checked_out, 2=fulfilled'
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
  applied_coupon: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string containing applied coupon details',
    get() {
      const rawValue = this.getDataValue('applied_coupon');
      if (!rawValue || rawValue === 'null' || rawValue === '') {
        return null;
      }
      try {
        return JSON.parse(rawValue);
      } catch (error) {
        console.error('Error parsing applied_coupon JSON:', error);
        return null;
      }
    },
    set(value) {
      this.setDataValue('applied_coupon', value ? JSON.stringify(value) : null);
    }
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total discount amount applied to the cart'
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Delivery fee for the cart'
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
Cart.prototype.addItem = function(productId, productName, price, quantity = 1, productImage = null, discount = 0) {
  const items = this.invoice_items || [];
  const existingItemIndex = items.findIndex(item => item.product_id === productId);

  // Calculate discounted price
  const originalPrice = parseFloat(price);
  const discountPercent = parseFloat(discount) || 0;
  const discountedPrice = originalPrice - (originalPrice * discountPercent / 100);

  if (existingItemIndex > -1) {
    // Update existing item quantity
    items[existingItemIndex].quantity += quantity;
    items[existingItemIndex].subtotal = items[existingItemIndex].quantity * items[existingItemIndex].discounted_price;
  } else {
    // Add new item
    items.push({
      product_id: productId,
      product_name: productName,
      original_price: originalPrice,
      price: discountedPrice, // This is the discounted price for backward compatibility
      discounted_price: discountedPrice,
      discount_percent: discountPercent,
      quantity: quantity,
      subtotal: discountedPrice * quantity,
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
      // Use discounted_price if available, otherwise use price
      const itemPrice = items[itemIndex].discounted_price || items[itemIndex].price;
      items[itemIndex].subtotal = items[itemIndex].quantity * itemPrice;
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

Cart.prototype.calculateProductDiscounts = function() {
  const items = this.invoice_items || [];
  let totalOriginalAmount = 0;
  let totalDiscountedAmount = 0;

  items.forEach(item => {
    const originalPrice = item.original_price || item.price;
    const discountedPrice = item.discounted_price || item.price;

    totalOriginalAmount += originalPrice * item.quantity;
    totalDiscountedAmount += discountedPrice * item.quantity;
  });

  return {
    original_total: parseFloat(totalOriginalAmount.toFixed(2)),
    discounted_total: parseFloat(totalDiscountedAmount.toFixed(2)),
    product_discount_amount: parseFloat((totalOriginalAmount - totalDiscountedAmount).toFixed(2))
  };
};

Cart.prototype.applyCoupon = function(couponData) {
  this.applied_coupon = {
    coupon_id: couponData.coupon_id,
    code: couponData.code,
    discount_amount: couponData.discount_amount,
    coupon_type: couponData.coupon_type,
    discount_value: couponData.discount_value,
    applied_at: new Date()
  };
  this.discount_amount = parseFloat(couponData.discount_amount.toFixed(2));
  return this;
};

Cart.prototype.removeCoupon = function() {
  this.applied_coupon = null;
  this.discount_amount = 0.00;
  return this;
};

Cart.prototype.calculateFinalAmount = function() {
  const subtotal = parseFloat(this.total_amount) || 0;
  const discount = parseFloat(this.discount_amount) || 0;
  const deliveryFee = parseFloat(this.delivery_fee) || 0;

  const finalAmount = subtotal - discount + deliveryFee;
  return parseFloat(finalAmount.toFixed(2));
};

Cart.prototype.getPaymentDetails = function() {
  const productDiscounts = this.calculateProductDiscounts();
  const couponDiscount = parseFloat(this.discount_amount) || 0;
  const totalBagDiscount = productDiscounts.product_discount_amount + couponDiscount;

  // Calculate final amount inline to avoid the error
  const subtotal = parseFloat(this.total_amount) || 0;
  const discount = parseFloat(this.discount_amount) || 0;
  const deliveryFee = parseFloat(this.delivery_fee) || 0;
  const finalAmount = subtotal - discount + deliveryFee;

  return {
    bag_total: productDiscounts.original_total || 0, // Original total before any discounts
    bag_discount: totalBagDiscount, // Product discounts + coupon discounts
    product_discount: productDiscounts.product_discount_amount, // Just product discounts
    coupon_discount: couponDiscount, // Just coupon discounts
    delivery_fee: this.delivery_fee || 0,
    amount_payable: parseFloat(finalAmount.toFixed(2)),
    applied_coupon: this.applied_coupon
  };
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
