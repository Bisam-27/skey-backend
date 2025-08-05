const { Op } = require('sequelize');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Product = require('../models/product');
const User = require('../models/user');
const sequelize = require('../config/db');

// Get all orders for the authenticated vendor with pagination and filtering
const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      search = '',
      fulfillment_status
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const whereClause = {};
    
    if (fulfillment_status) {
      whereClause.fulfillment_status = fulfillment_status;
    }

    if (search) {
      whereClause[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { customer_email: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sort parameters
    const validSortFields = ['id', 'order_number', 'total_amount', 'created_at', 'fulfillment_status'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'items',
        where: { vendor_id: vendorId },
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image_1_url', 'img_url']
        }]
      }, {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role'],
        required: false
      }],
      limit: limitNum,
      offset: offset,
      order: [[finalSortBy, finalSortOrder]],
      distinct: true
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: {
        orders: orders,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_orders: count,
          orders_per_page: limitNum,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get fulfilled orders for the authenticated vendor
const getVendorFulfilledOrders = async (req, res) => {
  try {
    req.query.fulfillment_status = 'fulfilled';
    return getVendorOrders(req, res);
  } catch (error) {
    console.error('Get vendor fulfilled orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get unfulfilled orders for the authenticated vendor
const getVendorUnfulfilledOrders = async (req, res) => {
  try {
    req.query.fulfillment_status = 'unfulfilled';
    return getVendorOrders(req, res);
  } catch (error) {
    console.error('Get vendor unfulfilled orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get order statistics for the authenticated vendor
const getVendorOrderStats = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get total orders count for this vendor
    const totalOrders = await Order.count({
      include: [{
        model: OrderItem,
        as: 'items',
        where: { vendor_id: vendorId }
      }],
      distinct: true
    });

    // Get fulfilled orders count
    const fulfilledOrders = await Order.count({
      where: { fulfillment_status: 'fulfilled' },
      include: [{
        model: OrderItem,
        as: 'items',
        where: { vendor_id: vendorId }
      }],
      distinct: true
    });

    // Get unfulfilled orders count
    const unfulfilledOrders = await Order.count({
      where: { fulfillment_status: 'unfulfilled' },
      include: [{
        model: OrderItem,
        as: 'items',
        where: { vendor_id: vendorId }
      }],
      distinct: true
    });

    // Get total revenue for this vendor
    const revenueResult = await OrderItem.findAll({
      where: { vendor_id: vendorId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('line_total')), 'total_revenue']
      ],
      raw: true
    });

    const totalRevenue = parseFloat(revenueResult[0]?.total_revenue || 0);

    // Get monthly revenue for this vendor
    const monthlyRevenueResult = await OrderItem.findAll({
      where: {
        vendor_id: vendorId,
        created_at: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('line_total')), 'monthly_revenue']
      ],
      raw: true
    });

    const monthlyRevenue = parseFloat(monthlyRevenueResult[0]?.monthly_revenue || 0);

    res.status(200).json({
      success: true,
      data: {
        total_orders: totalOrders,
        fulfilled_orders: fulfilledOrders,
        unfulfilled_orders: unfulfilledOrders,
        total_revenue: totalRevenue,
        monthly_revenue: monthlyRevenue
      }
    });

  } catch (error) {
    console.error('Get vendor order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update order fulfillment status (vendor can mark as fulfilled/unfulfilled)
const updateVendorOrderStatus = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { orderId } = req.params;
    const { fulfillment_status } = req.body;

    if (!['fulfilled', 'unfulfilled'].includes(fulfillment_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fulfillment status'
      });
    }

    // Check if the order contains items from this vendor
    const order = await Order.findOne({
      where: { id: orderId },
      include: [{
        model: OrderItem,
        as: 'items',
        where: { vendor_id: vendorId }
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to this vendor'
      });
    }

    // Update the order fulfillment status
    await order.update({ fulfillment_status });

    res.status(200).json({
      success: true,
      message: `Order marked as ${fulfillment_status}`,
      data: {
        order_id: order.id,
        order_number: order.order_number,
        fulfillment_status: order.fulfillment_status
      }
    });

  } catch (error) {
    console.error('Update vendor order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getVendorOrders,
  getVendorFulfilledOrders,
  getVendorUnfulfilledOrders,
  getVendorOrderStats,
  updateVendorOrderStatus
};
