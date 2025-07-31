const { Cart, Product, User, Coupon, Category } = require('../models/associations');
const { Op } = require('sequelize');

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate input
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    // Check if product exists and get all fields including image URLs
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Debug: Log the product data to see what image fields are available
    console.log('=== PRODUCT DEBUG INFO ===');
    console.log('Product ID:', product.id);
    console.log('Product Name:', product.name);
    console.log('image_1_url:', product.image_1_url);
    console.log('img_url:', product.img_url);
    console.log('image_2_url:', product.image_2_url);
    console.log('image_3_url:', product.image_3_url);
    console.log('All product fields:', Object.keys(product.dataValues));
    console.log('Full product data:', product.dataValues);
    console.log('=== END DEBUG INFO ===');

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Get user details
    const user = await User.findByPk(userId);
    
    // Find or create cart for user
    let cart = await Cart.findOrCreateForUser(userId, user.email);

    // Determine the best image URL to use - with multiple fallbacks
    let imageUrl = null;

    // Try different image fields in order of preference
    if (product.image_1_url && product.image_1_url.trim() !== '') {
      imageUrl = product.image_1_url.trim();
    } else if (product.img_url && product.img_url.trim() !== '') {
      imageUrl = product.img_url.trim();
    } else if (product.image_2_url && product.image_2_url.trim() !== '') {
      imageUrl = product.image_2_url.trim();
    } else if (product.image_3_url && product.image_3_url.trim() !== '') {
      imageUrl = product.image_3_url.trim();
    }

    console.log('=== IMAGE URL DEBUG ===');
    console.log('product.image_1_url:', product.image_1_url);
    console.log('product.img_url:', product.img_url);
    console.log('product.image_2_url:', product.image_2_url);
    console.log('Final imageUrl selected:', imageUrl);
    console.log('=== END IMAGE DEBUG ===');

    // Add item to cart with proper image URL and discount
    cart.addItem(
      product.id,
      product.name,
      product.price,
      quantity,
      imageUrl,
      product.discount || 0
    );

    // Generate invoice ID if not exists
    if (!cart.invoice_id) {
      cart.invoice_id = `INV-${Date.now()}-${userId}`;
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      data: {
        cart_id: cart.id,
        items: cart.invoice_items,
        item_count: cart.getItemCount(),
        total_amount: cart.total_amount,
        payment_details: cart.getPaymentDetails(),
        product: {
          id: product.id,
          name: product.name,
          price: product.price
        }
      }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while adding to cart'
    });
  }
};

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findByUserId(userId);

    if (!cart || cart.isEmpty()) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty',
        data: {
          cart: null,
          items: [],
          item_count: 0,
          total_amount: 0
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        cart: {
          id: cart.id,
          invoice_id: cart.invoice_id,
          status: cart.status,
          total_amount: cart.total_amount,
          created_at: cart.created_at,
          updated_at: cart.updated_at
        },
        items: cart.invoice_items,
        item_count: cart.getItemCount(),
        total_amount: cart.total_amount,
        payment_details: cart.getPaymentDetails()
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving cart'
    });
  }
};

// Update item quantity in cart
const updateCartItem = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative'
      });
    }

    // Find user's cart
    const cart = await Cart.findByUserId(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Check if product exists in cart
    const items = cart.invoice_items || [];
    const itemExists = items.some(item => item.product_id == product_id);
    
    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart'
      });
    }

    // Update item quantity
    cart.updateItemQuantity(parseInt(product_id), quantity);
    await cart.save();

    res.status(200).json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated successfully',
      data: {
        cart_id: cart.id,
        items: cart.invoice_items,
        item_count: cart.getItemCount(),
        total_amount: cart.total_amount,
        payment_details: cart.getPaymentDetails()
      }
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating cart'
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { product_id } = req.params;
    const userId = req.user.id;

    // Find user's cart
    const cart = await Cart.findByUserId(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item from cart
    cart.removeItem(parseInt(product_id));
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart_id: cart.id,
        items: cart.invoice_items,
        item_count: cart.getItemCount(),
        total_amount: cart.total_amount,
        payment_details: cart.getPaymentDetails()
      }
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while removing from cart'
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findByUserId(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Clear all items
    cart.invoice_items = [];
    cart.total_amount = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart_id: cart.id,
        items: [],
        item_count: 0,
        total_amount: 0
      }
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while clearing cart'
    });
  }
};

// Get cart item count (for navbar badge)
const getCartCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findByUserId(userId);
    const itemCount = cart ? cart.getItemCount() : 0;

    res.status(200).json({
      success: true,
      data: {
        item_count: itemCount
      }
    });

  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting cart count'
    });
  }
};



// Apply coupon to cart
const applyCouponToCart = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    // Find user's cart
    const cart = await Cart.findByUserId(userId);
    if (!cart || cart.isEmpty()) {
      return res.status(404).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Get product IDs from cart
    const productIds = cart.invoice_items.map(item => item.product_id);
    const orderAmount = cart.total_amount;

    // Validate coupon
    const coupon = await Coupon.findOne({
      where: {
        code: code.toUpperCase(),
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
      ]
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon can be used
    if (!coupon.canBeUsed()) {
      let message = 'Coupon cannot be used';
      if (coupon.isExpired()) {
        message = 'Coupon has expired';
      } else if (coupon.isUsageLimitReached()) {
        message = 'Coupon usage limit reached';
      }

      return res.status(400).json({
        success: false,
        message
      });
    }

    // Check minimum order amount
    if (coupon.minimum_order_amount && orderAmount < coupon.minimum_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimum_order_amount} required`
      });
    }

    // For product-specific coupons, check if the product is in the order
    if (coupon.product_type === 'product' && productIds.length > 0) {
      if (!productIds.includes(coupon.product_id)) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is only valid for specific products'
        });
      }
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount);

    // Apply coupon to cart
    cart.applyCoupon({
      coupon_id: coupon.id,
      code: coupon.code,
      discount_amount: discountAmount,
      coupon_type: coupon.coupon_type,
      discount_value: coupon.discount_value
    });

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        cart_id: cart.id,
        items: cart.invoice_items,
        item_count: cart.getItemCount(),
        total_amount: cart.total_amount,
        payment_details: cart.getPaymentDetails()
      }
    });

  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while applying coupon'
    });
  }
};

// Remove coupon from cart
const removeCouponFromCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's cart
    const cart = await Cart.findByUserId(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove coupon from cart
    cart.removeCoupon();
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Coupon removed successfully',
      data: {
        cart_id: cart.id,
        items: cart.invoice_items,
        item_count: cart.getItemCount(),
        total_amount: cart.total_amount,
        payment_details: cart.getPaymentDetails()
      }
    });

  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while removing coupon'
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  applyCouponToCart,
  removeCouponFromCart
};
