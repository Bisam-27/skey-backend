const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Wishlist = sequelize.define('Wishlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to user table'
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Reference to product table'
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
  tableName: 'wishlist',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'product_id'],
      name: 'unique_user_product_wishlist'
    },
    {
      fields: ['user_id'],
      name: 'wishlist_user_id_index'
    },
    {
      fields: ['product_id'],
      name: 'wishlist_product_id_index'
    }
  ],
  hooks: {
    beforeUpdate: (wishlist) => {
      wishlist.updated_at = new Date();
    }
  }
});

// Class methods
Wishlist.findByUserId = async function(userId) {
  return await Wishlist.findAll({ 
    where: { 
      user_id: userId 
    },
    order: [['created_at', 'DESC']]
  });
};

Wishlist.findByUserAndProduct = async function(userId, productId) {
  return await Wishlist.findOne({ 
    where: { 
      user_id: userId,
      product_id: productId
    } 
  });
};

Wishlist.addToWishlist = async function(userId, productId) {
  // Check if item already exists
  const existingItem = await Wishlist.findByUserAndProduct(userId, productId);
  
  if (existingItem) {
    return { 
      success: false, 
      message: 'Product already in wishlist',
      item: existingItem 
    };
  }
  
  // Add new item
  const newItem = await Wishlist.create({
    user_id: userId,
    product_id: productId
  });
  
  return { 
    success: true, 
    message: 'Product added to wishlist',
    item: newItem 
  };
};

Wishlist.removeFromWishlist = async function(userId, productId) {
  const deletedCount = await Wishlist.destroy({
    where: {
      user_id: userId,
      product_id: productId
    }
  });
  
  return {
    success: deletedCount > 0,
    message: deletedCount > 0 ? 'Product removed from wishlist' : 'Product not found in wishlist',
    deletedCount
  };
};

Wishlist.getWishlistCount = async function(userId) {
  return await Wishlist.count({
    where: {
      user_id: userId
    }
  });
};

Wishlist.isInWishlist = async function(userId, productId) {
  const item = await Wishlist.findByUserAndProduct(userId, productId);
  return !!item;
};

Wishlist.clearWishlist = async function(userId) {
  const deletedCount = await Wishlist.destroy({
    where: {
      user_id: userId
    }
  });
  
  return {
    success: true,
    message: `Removed ${deletedCount} items from wishlist`,
    deletedCount
  };
};

// Instance methods
Wishlist.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = Wishlist;
