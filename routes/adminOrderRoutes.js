const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  getFulfilledOrders,
  getUnfulfilledOrders,
  getVendorAnalytics
} = require('../controllers/adminOrderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin order routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/orders - Get all orders with pagination and filtering
router.get('/', getAllOrders);

// GET /api/admin/orders/stats - Get order statistics
router.get('/stats', getOrderStats);

// GET /api/admin/orders/vendor-analytics - Get vendor sales analytics
router.get('/vendor-analytics', getVendorAnalytics);

// GET /api/admin/orders/fulfilled - Get fulfilled orders
router.get('/fulfilled', getFulfilledOrders);

// GET /api/admin/orders/unfulfilled - Get unfulfilled orders
router.get('/unfulfilled', getUnfulfilledOrders);

// GET /api/admin/orders/:id - Get specific order by ID
router.get('/:id', getOrderById);

// PUT /api/admin/orders/:id/status - Update order status
router.put('/:id/status', updateOrderStatus);

module.exports = router;
