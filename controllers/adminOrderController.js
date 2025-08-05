const { Order, OrderItem, Product, User } = require('../models/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// Get all orders with pagination and filtering
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for orders table
    let whereClause = {};

    // Add fulfillment status filter
    if (status) {
      if (status === '1') {
        whereClause.fulfillment_status = 'unfulfilled';
      } else if (status === '2') {
        whereClause.fulfillment_status = 'fulfilled';
      }
    }

    // Add date range filter
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Add search filter (search by order_number or customer email)
    if (search) {
      whereClause[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { customer_email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sort parameters
    const validSortFields = ['id', 'order_number', 'total_amount', 'fulfillment_status', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role'],
          required: false
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'image_1_url', 'img_url', 'vendor_id'],
              include: [
                {
                  model: User,
                  as: 'vendor',
                  attributes: ['id', 'email', 'role'],
                  required: false
                }
              ],
              required: false
            }
          ]
        }
      ],
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    // Format orders data
    const formattedOrders = orders.map(order => {
      const orderData = order.toJSON();

      // The total_amount already includes all calculations (subtotal - discount + delivery)
      const finalAmount = parseFloat(orderData.total_amount) || 0;
      const subtotal = parseFloat(orderData.subtotal) || 0;
      const discountAmount = parseFloat(orderData.discount_amount) || 0;
      const deliveryFee = parseFloat(orderData.delivery_fee) || 0;

      return {
        ...orderData,
        final_amount: finalAmount,
        subtotal: subtotal,
        discount_amount: discountAmount,
        delivery_fee: deliveryFee,
        status_text: getOrderStatusText(orderData.fulfillment_status),
        item_count: orderData.items ? orderData.items.length : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalOrders: count,
          ordersPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get fulfilled orders
const getFulfilledOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC', search, startDate, endDate } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for fulfilled orders only
    let whereClause = {
      fulfillment_status: 'fulfilled' // Only fulfilled orders
    };

    // Add date range filter
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { customer_email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sort parameters
    const validSortFields = ['id', 'order_number', 'total_amount', 'fulfillment_status', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role'],
          required: false
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'image_1_url', 'img_url', 'vendor_id'],
              required: false
            }
          ]
        }
      ],
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset,
      distinct: true
    });

    const totalPages = Math.ceil(count / limitNum);

    // Format orders data
    const formattedOrders = orders.map(orderData => {
      const finalAmount = parseFloat(orderData.total_amount) || 0;
      const subtotal = parseFloat(orderData.subtotal) || 0;
      const discountAmount = parseFloat(orderData.discount_amount) || 0;
      const deliveryFee = parseFloat(orderData.delivery_fee) || 0;

      return {
        ...orderData.toJSON(),
        final_amount: finalAmount,
        subtotal: subtotal,
        discount_amount: discountAmount,
        delivery_fee: deliveryFee,
        status_text: getOrderStatusText(orderData.fulfillment_status),
        item_count: orderData.items ? orderData.items.length : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalOrders: count,
          ordersPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching fulfilled orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get unfulfilled orders
const getUnfulfilledOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC', search, startDate, endDate } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for unfulfilled orders only
    let whereClause = {
      fulfillment_status: 'unfulfilled' // Only unfulfilled orders
    };

    // Add date range filter
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { customer_email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sort parameters
    const validSortFields = ['id', 'order_number', 'total_amount', 'fulfillment_status', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role'],
          required: false
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'image_1_url', 'img_url', 'vendor_id'],
              required: false
            }
          ]
        }
      ],
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset,
      distinct: true
    });

    const totalPages = Math.ceil(count / limitNum);

    // Format orders data
    const formattedOrders = orders.map(orderData => {
      const finalAmount = parseFloat(orderData.total_amount) || 0;
      const subtotal = parseFloat(orderData.subtotal) || 0;
      const discountAmount = parseFloat(orderData.discount_amount) || 0;
      const deliveryFee = parseFloat(orderData.delivery_fee) || 0;

      return {
        ...orderData.toJSON(),
        final_amount: finalAmount,
        subtotal: subtotal,
        discount_amount: discountAmount,
        delivery_fee: deliveryFee,
        status_text: getOrderStatusText(orderData.fulfillment_status),
        item_count: orderData.items ? orderData.items.length : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalOrders: count,
          ordersPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching unfulfilled orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get specific order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role'],
          required: false
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'image_url', 'vendor_id'],
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

    const orderData = order.toJSON();

    // The total_amount already includes all calculations
    const finalAmount = parseFloat(orderData.total_amount) || 0;
    const subtotal = parseFloat(orderData.subtotal) || 0;
    const discountAmount = parseFloat(orderData.discount_amount) || 0;
    const deliveryFee = parseFloat(orderData.delivery_fee) || 0;

    const formattedOrder = {
      ...orderData,
      final_amount: finalAmount,
      subtotal: subtotal,
      discount_amount: discountAmount,
      delivery_fee: deliveryFee,
      status_text: getOrderStatusText(orderData.fulfillment_status),
      item_count: orderData.items ? orderData.items.length : 0
    };

    res.status(200).json({
      success: true,
      data: formattedOrder
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['unfulfilled', 'fulfilled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be "unfulfilled" or "fulfilled"'
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    await order.update({
      fulfillment_status: status,
      order_status: status === 'fulfilled' ? 'delivered' : 'confirmed'
    });

    res.status(200).json({
      success: true,
      message: `Order ${status} successfully`,
      data: {
        id: order.id,
        fulfillment_status: status,
        status_text: getOrderStatusText(status)
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get order statistics with sales data
const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      totalOrders,
      fulfilledOrders,
      unfulfilledOrders,
      todayOrders,
      monthlyOrders,
      yearlyOrders,
      totalSales,
      todaySales,
      monthlySales,
      yearlySales
    ] = await Promise.all([
      // Order counts
      Order.count(),
      Order.count({ where: { fulfillment_status: 'fulfilled' } }),
      Order.count({ where: { fulfillment_status: 'unfulfilled' } }),
      Order.count({ where: { created_at: { [Op.gte]: startOfToday } } }),
      Order.count({ where: { created_at: { [Op.gte]: startOfMonth } } }),
      Order.count({ where: { created_at: { [Op.gte]: startOfYear } } }),

      // Sales data
      Order.sum('total_amount'),
      Order.sum('total_amount', { where: { created_at: { [Op.gte]: startOfToday } } }),
      Order.sum('total_amount', { where: { created_at: { [Op.gte]: startOfMonth } } }),
      Order.sum('total_amount', { where: { created_at: { [Op.gte]: startOfYear } } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          fulfilled: fulfilledOrders,
          unfulfilled: unfulfilledOrders,
          today: todayOrders,
          monthly: monthlyOrders,
          yearly: yearlyOrders
        },
        sales: {
          total: parseFloat(totalSales) || 0,
          today: parseFloat(todaySales) || 0,
          monthly: parseFloat(monthlySales) || 0,
          yearly: parseFloat(yearlySales) || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get vendor analytics for admin
const getVendorAnalytics = async (req, res) => {
  try {
    // Get vendor sales breakdown
    const vendorSales = await OrderItem.findAll({
      attributes: [
        'vendor_id',
        [sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'total_items'],
        [sequelize.fn('SUM', sequelize.col('line_total')), 'total_revenue']
      ],
      include: [
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'email', 'role'],
          required: false
        }
      ],
      group: ['vendor_id', 'vendor.id'],
      order: [[sequelize.fn('SUM', sequelize.col('line_total')), 'DESC']]
    });

    // Get admin-created product sales (vendor_id is null)
    const adminSales = await OrderItem.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'total_items'],
        [sequelize.fn('SUM', sequelize.col('line_total')), 'total_revenue']
      ],
      where: { vendor_id: null },
      raw: true
    });

    const formattedVendorSales = vendorSales.map(item => ({
      vendor_id: item.vendor_id,
      vendor_email: item.vendor ? item.vendor.email : null,
      total_items: parseInt(item.dataValues.total_items) || 0,
      total_revenue: parseFloat(item.dataValues.total_revenue) || 0
    }));

    res.status(200).json({
      success: true,
      data: {
        vendor_sales: formattedVendorSales,
        admin_sales: {
          total_items: parseInt(adminSales[0]?.total_items) || 0,
          total_revenue: parseFloat(adminSales[0]?.total_revenue) || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to get status text
const getOrderStatusText = (status) => {
  switch (status) {
    case 'unfulfilled': return 'Unfulfilled';
    case 'fulfilled': return 'Fulfilled';
    default: return 'Unknown';
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  getFulfilledOrders,
  getUnfulfilledOrders,
  getVendorAnalytics
};
