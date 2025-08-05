const { Order, OrderItem, Product } = require('../models/associations');
const { Op } = require('sequelize');

// Get current user's orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get orders for the current user
    const { count, rows: orders } = await Order.findAndCountAll({
      where: {
        user_id: userId
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'image_1_url', 'img_url', 'subcategory_id'],
              required: false
            }
          ]
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // Format orders for frontend
    const formattedOrders = orders.map(order => {
      const orderData = order.toJSON();
      
      // Format order items with product details
      const formattedItems = orderData.items.map(item => {
        // Get the best available image from product or order item
        const productImage = item.product_image ||
                           (item.product ? (item.product.image_1_url || item.product.img_url) : null) ||
                           'img/placeholder.jpg';

        return {
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: productImage,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          final_price: parseFloat(item.final_price),
          line_total: parseFloat(item.line_total),
          size: item.product_attributes?.size || null,
          color: item.product_attributes?.color || null,
          subcategory_id: item.product?.subcategory_id || null
        };
      });

      return {
        id: orderData.id,
        order_number: orderData.order_number,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        shipping_address: orderData.shipping_address,
        subtotal: parseFloat(orderData.subtotal),
        discount_amount: parseFloat(orderData.discount_amount),
        coupon_code: orderData.coupon_code,
        total_amount: parseFloat(orderData.total_amount),
        order_status: orderData.order_status,
        fulfillment_status: orderData.fulfillment_status,
        payment_status: orderData.payment_status,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
        items: formattedItems
      };
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: count,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get specific order details for current user
const getUserOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    // Validate order ID
    if (!orderId || isNaN(parseInt(orderId))) {
      return res.status(400).json({
        success: false,
        message: 'Valid order ID is required'
      });
    }

    // Get specific order for the current user
    const order = await Order.findOne({
      where: {
        id: parseInt(orderId),
        user_id: userId
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'image_1_url', 'img_url', 'subcategory_id'],
              required: false
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Format order for frontend
    const orderData = order.toJSON();
    
    const formattedItems = orderData.items.map(item => {
      // Get the best available image from product or order item
      const productImage = item.product_image ||
                         (item.product ? (item.product.image_1_url || item.product.img_url) : null) ||
                         'img/placeholder.jpg';

      return {
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: productImage,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        final_price: parseFloat(item.final_price),
        line_total: parseFloat(item.line_total),
        size: item.product_attributes?.size || null,
        color: item.product_attributes?.color || null,
        subcategory_id: item.product?.subcategory_id || null
      };
    });

    const formattedOrder = {
      id: orderData.id,
      order_number: orderData.order_number,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      shipping_address: orderData.shipping_address,
      subtotal: parseFloat(orderData.subtotal),
      discount_amount: parseFloat(orderData.discount_amount),
      coupon_code: orderData.coupon_code,
      total_amount: parseFloat(orderData.total_amount),
      order_status: orderData.order_status,
      fulfillment_status: orderData.fulfillment_status,
      payment_status: orderData.payment_status,
      created_at: orderData.created_at,
      updated_at: orderData.updated_at,
      items: formattedItems
    };

    res.json({
      success: true,
      data: formattedOrder
    });

  } catch (error) {
    console.error('Error fetching user order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

module.exports = {
  getUserOrders,
  getUserOrderById
};
