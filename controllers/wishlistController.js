const { Wishlist, Product, User } = require('../models/associations');
const { Op } = require('sequelize');

// Add item to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate input
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Add to wishlist using model method
    const result = await Wishlist.addToWishlist(userId, product_id);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          wishlist_item: result.item,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image_1_url: product.image_1_url
          }
        }
      });
    } else {
      res.status(409).json({
        success: false,
        message: result.message,
        data: {
          existing_item: result.item
        }
      });
    }

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while adding to wishlist'
    });
  }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get wishlist items with product details
    const wishlistItems = await Wishlist.findAll({
      where: { user_id: userId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'image_1_url', 'img_url', 'image_2_url', 'stock', 'discount']
      }],
      order: [['created_at', 'DESC']]
    });

    // Format the response
    const formattedItems = wishlistItems.map(item => ({
      id: item.id,
      product_id: item.product_id,
      added_at: item.created_at,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image_url: item.product.image_1_url || item.product.img_url || item.product.image_2_url,
        stock: item.product.stock,
        discount: item.product.discount,
        discounted_price: item.product.discount ? 
          (item.product.price - (item.product.price * item.product.discount / 100)).toFixed(2) : 
          item.product.price
      }
    }));

    res.status(200).json({
      success: true,
      message: 'Wishlist retrieved successfully',
      data: {
        items: formattedItems,
        item_count: formattedItems.length
      }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving wishlist'
    });
  }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { product_id } = req.params;
    const userId = req.user.id;

    // Validate input
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Remove from wishlist using model method
    const result = await Wishlist.removeFromWishlist(userId, parseInt(product_id));

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          removed_count: result.deletedCount
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while removing from wishlist'
    });
  }
};

// Check if product is in wishlist
const checkWishlistStatus = async (req, res) => {
  try {
    const { product_id } = req.params;
    const userId = req.user.id;

    const isInWishlist = await Wishlist.isInWishlist(userId, parseInt(product_id));

    res.status(200).json({
      success: true,
      data: {
        is_in_wishlist: isInWishlist,
        product_id: parseInt(product_id)
      }
    });

  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while checking wishlist status'
    });
  }
};

// Get wishlist count
const getWishlistCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Wishlist.getWishlistCount(userId);

    res.status(200).json({
      success: true,
      data: {
        item_count: count
      }
    });

  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting wishlist count'
    });
  }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Wishlist.clearWishlist(userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        removed_count: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while clearing wishlist'
    });
  }
};

// Toggle wishlist (add if not exists, remove if exists)
const toggleWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id;

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if already in wishlist
    const isInWishlist = await Wishlist.isInWishlist(userId, product_id);

    if (isInWishlist) {
      // Remove from wishlist
      const result = await Wishlist.removeFromWishlist(userId, product_id);
      res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
        data: {
          action: 'removed',
          is_in_wishlist: false,
          product_id: product_id
        }
      });
    } else {
      // Add to wishlist
      const result = await Wishlist.addToWishlist(userId, product_id);
      res.status(201).json({
        success: true,
        message: 'Product added to wishlist',
        data: {
          action: 'added',
          is_in_wishlist: true,
          product_id: product_id,
          wishlist_item: result.item
        }
      });
    }

  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while toggling wishlist'
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  getWishlistCount,
  clearWishlist,
  toggleWishlist
};
