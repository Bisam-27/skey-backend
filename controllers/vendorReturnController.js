const { Op } = require('sequelize');
const Return = require('../models/return');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Product = require('../models/product');
const User = require('../models/user');
const sequelize = require('../config/db');

// Get all returns for the authenticated vendor with pagination and filtering
const getVendorReturns = async (req, res) => {
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
    const whereClause = {
      vendor_id: vendorId
    };
    
    if (fulfillment_status) {
      whereClause.fulfillment_status = fulfillment_status;
    }

    if (search) {
      whereClause[Op.or] = [
        { return_number: { [Op.like]: `%${search}%` } },
        { product_name: { [Op.like]: `%${search}%` } },
        { return_reason: { [Op.like]: `%${search}%` } }
      ];
    }

    // Validate sort parameters
    const validSortFields = ['id', 'return_number', 'refund_amount', 'created_at', 'fulfillment_status'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows: returns } = await Return.findAndCountAll({
      where: whereClause,
      include: [{
        model: Order,
        as: 'order',
        attributes: ['id', 'order_number', 'customer_email', 'created_at']
      }, {
        model: OrderItem,
        as: 'orderItem',
        attributes: ['id', 'product_name', 'unit_price', 'quantity']
      }, {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'image_1_url', 'img_url']
      }, {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role']
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
        returns: returns,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_returns: count,
          returns_per_page: limitNum,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get vendor returns error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get fulfilled returns for the authenticated vendor
const getVendorFulfilledReturns = async (req, res) => {
  try {
    req.query.fulfillment_status = 'fulfilled';
    return getVendorReturns(req, res);
  } catch (error) {
    console.error('Get vendor fulfilled returns error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get unfulfilled returns for the authenticated vendor
const getVendorUnfulfilledReturns = async (req, res) => {
  try {
    req.query.fulfillment_status = 'unfulfilled';
    return getVendorReturns(req, res);
  } catch (error) {
    console.error('Get vendor unfulfilled returns error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get return statistics for the authenticated vendor
const getVendorReturnStats = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get total returns count for this vendor
    const totalReturns = await Return.count({
      where: { vendor_id: vendorId }
    });

    // Get fulfilled returns count
    const fulfilledReturns = await Return.count({
      where: { 
        vendor_id: vendorId,
        fulfillment_status: 'fulfilled' 
      }
    });

    // Get unfulfilled returns count
    const unfulfilledReturns = await Return.count({
      where: { 
        vendor_id: vendorId,
        fulfillment_status: 'unfulfilled' 
      }
    });

    // Get total refund amount for this vendor
    const refundResult = await Return.findAll({
      where: { vendor_id: vendorId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('refund_amount')), 'total_refunds']
      ],
      raw: true
    });

    const totalRefunds = parseFloat(refundResult[0]?.total_refunds || 0);

    // Get monthly refunds for this vendor
    const monthlyRefundResult = await Return.findAll({
      where: {
        vendor_id: vendorId,
        created_at: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('refund_amount')), 'monthly_refunds']
      ],
      raw: true
    });

    const monthlyRefunds = parseFloat(monthlyRefundResult[0]?.monthly_refunds || 0);

    res.status(200).json({
      success: true,
      data: {
        total_returns: totalReturns,
        fulfilled_returns: fulfilledReturns,
        unfulfilled_returns: unfulfilledReturns,
        total_refunds: totalRefunds,
        monthly_refunds: monthlyRefunds
      }
    });

  } catch (error) {
    console.error('Get vendor return stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update return fulfillment status (vendor can mark as fulfilled/unfulfilled)
const updateVendorReturnStatus = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { returnId } = req.params;
    const { fulfillment_status, vendor_notes } = req.body;

    if (!['fulfilled', 'unfulfilled'].includes(fulfillment_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fulfillment status'
      });
    }

    // Check if the return belongs to this vendor
    const returnRecord = await Return.findOne({
      where: { 
        id: returnId,
        vendor_id: vendorId 
      }
    });

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: 'Return not found or does not belong to this vendor'
      });
    }

    // Update the return fulfillment status
    const updateData = { fulfillment_status };
    if (vendor_notes) {
      updateData.vendor_notes = vendor_notes;
    }

    // Set processed_at timestamp if marking as fulfilled
    if (fulfillment_status === 'fulfilled' && returnRecord.fulfillment_status !== 'fulfilled') {
      updateData.processed_at = new Date();
      updateData.return_status = 'processed';
    }

    await returnRecord.update(updateData);

    res.status(200).json({
      success: true,
      message: `Return marked as ${fulfillment_status}`,
      data: {
        return_id: returnRecord.id,
        return_number: returnRecord.return_number,
        fulfillment_status: returnRecord.fulfillment_status
      }
    });

  } catch (error) {
    console.error('Update vendor return status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getVendorReturns,
  getVendorFulfilledReturns,
  getVendorUnfulfilledReturns,
  getVendorReturnStats,
  updateVendorReturnStatus
};
