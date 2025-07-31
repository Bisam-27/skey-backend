const Cart = require('../models/cart');
const Address = require('../models/address');
const User = require('../models/user');
const Product = require('../models/product');
const { Order, OrderItem, Coupon, CouponUsage } = require('../models/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// Get checkout data (cart items, addresses, payment details)
const getCheckoutData = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's active cart
    const cart = await Cart.findByUserId(userId);
    if (!cart || cart.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Get user's addresses
    const addresses = await Address.findByUserId(userId);

    // Get user info
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'role']
    });

    // Get payment details
    const paymentDetails = cart.getPaymentDetails();

    res.status(200).json({
      success: true,
      data: {
        cart: {
          id: cart.id,
          items: cart.invoice_items,
          item_count: cart.getItemCount(),
          total_amount: cart.total_amount,
          applied_coupon: cart.applied_coupon,
          discount_amount: cart.discount_amount,
          delivery_fee: cart.delivery_fee
        },
        payment_details: paymentDetails,
        addresses: addresses,
        user: user
      }
    });

  } catch (error) {
    console.error('Get checkout data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create or update address
const saveAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      id,
      name,
      first_name,
      last_name,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default,
      type
    } = req.body;

    // Validation
    if (!name || !first_name || !last_name || !address_line_1 || !city || !state || !postal_code) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    let address;

    if (id) {
      // Update existing address
      address = await Address.findOne({
        where: { id, user_id: userId }
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      await address.update({
        name,
        first_name,
        last_name,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code,
        country: country || 'India',
        phone,
        is_default: is_default || false,
        type: type || 'both'
      });
    } else {
      // Create new address
      address = await Address.create({
        user_id: userId,
        name,
        first_name,
        last_name,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code,
        country: country || 'India',
        phone,
        is_default: is_default || false,
        type: type || 'both'
      });
    }

    // If this is set as default, unset other default addresses
    if (is_default) {
      await Address.update(
        { is_default: false },
        { 
          where: { 
            user_id: userId,
            id: { [require('sequelize').Op.ne]: address.id }
          }
        }
      );
    }

    res.status(200).json({
      success: true,
      message: id ? 'Address updated successfully' : 'Address created successfully',
      data: { address }
    });

  } catch (error) {
    console.error('Save address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const address = await Address.findOne({
      where: { id, user_id: userId }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.destroy();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Set default address
const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if address exists and belongs to user
    const address = await Address.findOne({
      where: { id, user_id: userId }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Unset all default addresses for this user
    await Address.update(
      { is_default: false },
      { where: { user_id: userId } }
    );

    // Set this address as default
    await address.update({ is_default: true });

    res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      data: { address }
    });

  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Complete order and reduce stock
const completeOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.userId;
    const { address_id, payment_method = 'COD' } = req.body;

    // Validate address
    if (!address_id) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Check if address belongs to user
    const address = await Address.findOne({
      where: { id: address_id, user_id: userId }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Invalid shipping address'
      });
    }

    // Get user's active cart
    const cart = await Cart.findByUserId(userId);
    if (!cart || cart.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock availability and reduce stock for each item
    const stockUpdates = [];
    const cartItems = cart.invoice_items || [];

    for (const item of cartItems) {
      const product = await Product.findByPk(item.product_id, { transaction });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Product "${item.product_name}" not found`
        });
      }

      // Check if enough stock is available
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product_name}". Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      // Prepare stock update
      stockUpdates.push({
        product: product,
        newStock: product.stock - item.quantity,
        orderedQuantity: item.quantity
      });
    }

    // Update stock for all products
    for (const update of stockUpdates) {
      await update.product.update(
        { stock: update.newStock },
        { transaction }
      );
    }

    // Get user information
    const user = await User.findByPk(userId, { transaction });

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${userId}`;

    // Calculate totals
    const subtotal = parseFloat(cart.total_amount) || 0;
    const discountAmount = parseFloat(cart.discount_amount) || 0;
    const deliveryFee = parseFloat(cart.delivery_fee) || 0;
    const totalAmount = subtotal - discountAmount + deliveryFee;

    // Create order record
    const order = await Order.create({
      order_number: orderNumber,
      user_id: userId,
      customer_email: user.email,
      customer_phone: null,
      customer_name: user.email,
      shipping_address: {
        name: address.name,
        phone: address.phone,
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country
      },
      billing_address: null,
      order_items: cartItems,
      subtotal: subtotal,
      discount_amount: discountAmount,
      coupon_code: cart.applied_coupon,
      delivery_fee: deliveryFee,
      tax_amount: 0.00,
      total_amount: totalAmount,
      payment_method: payment_method,
      payment_status: 'paid',
      order_status: 'confirmed',
      fulfillment_status: 'unfulfilled',
      order_notes: null
    }, { transaction });

    // Create order items
    for (const item of cartItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: null,
        vendor_id: null,
        sku: null,
        quantity: item.quantity,
        unit_price: parseFloat(item.price) || 0,
        discount_per_item: 0,
        final_price: parseFloat(item.discounted_price) || parseFloat(item.price) || 0,
        line_total: parseFloat(item.subtotal) || 0,
        product_attributes: {
          size: item.size || null,
          color: item.color || null
        }
      }, { transaction });
    }

    // Handle coupon usage tracking if coupon was applied
    if (cart.applied_coupon && cart.applied_coupon.coupon_id) {
      try {
        // Find the coupon
        const coupon = await Coupon.findByPk(cart.applied_coupon.coupon_id, { transaction });

        if (coupon) {
          // Record coupon usage
          await CouponUsage.create({
            coupon_id: coupon.id,
            user_id: userId,
            order_id: order.id,
            discount_amount: discountAmount,
            order_amount: subtotal
          }, { transaction });

          // Update coupon used count
          await coupon.increment('used_count', { transaction });
        }
      } catch (couponError) {
        console.error('Error tracking coupon usage:', couponError);
        // Don't fail the order if coupon tracking fails, just log it
      }
    }

    // Mark cart as completed (status: 1 = completed)
    await cart.update(
      {
        status: 1,
        updated_at: new Date()
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    // Prepare order summary
    const orderSummary = {
      order_id: order.id,
      order_number: order.order_number,
      invoice_id: cart.invoice_id,
      items: cartItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.discounted_price || item.price,
        subtotal: item.subtotal
      })),
      payment_details: cart.getPaymentDetails(),
      shipping_address: address,
      payment_method: payment_method,
      order_date: new Date(),
      total_amount: totalAmount,
      stock_updates: stockUpdates.map(update => ({
        product_id: update.product.id,
        product_name: update.product.name,
        ordered_quantity: update.orderedQuantity,
        remaining_stock: update.newStock
      }))
    };

    res.status(200).json({
      success: true,
      message: 'Order completed successfully',
      data: orderSummary
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Complete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while completing order'
    });
  }
};

module.exports = {
  getCheckoutData,
  saveAddress,
  deleteAddress,
  setDefaultAddress,
  completeOrder
};
