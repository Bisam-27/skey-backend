const express = require('express');
const router = express.Router();
const {
  getVendorOrders,
  getVendorFulfilledOrders,
  getVendorUnfulfilledOrders,
  getVendorOrderStats,
  updateVendorOrderStatus
} = require('../controllers/vendorOrderController');
const { authenticateToken, requireVendor } = require('../middleware/auth');

// All vendor order routes require authentication and vendor role
router.use(authenticateToken);
router.use(requireVendor);

// GET /api/vendor/orders - Get all orders for the authenticated vendor
router.get('/', getVendorOrders);

// GET /api/vendor/orders/stats - Get order statistics for the authenticated vendor
router.get('/stats', getVendorOrderStats);

// GET /api/vendor/orders/fulfilled - Get fulfilled orders for the authenticated vendor
router.get('/fulfilled', getVendorFulfilledOrders);

// GET /api/vendor/orders/unfulfilled - Get unfulfilled orders for the authenticated vendor
router.get('/unfulfilled', getVendorUnfulfilledOrders);

// PUT /api/vendor/orders/:orderId/status - Update order fulfillment status
router.put('/:orderId/status', updateVendorOrderStatus);

module.exports = router;
