const express = require('express');
const router = express.Router();
const {
  getUserOrders,
  getUserOrderById
} = require('../controllers/userOrderController');
const { authenticateToken } = require('../middleware/auth');

// All user order routes require authentication
router.use(authenticateToken);

// GET /api/user/orders - Get current user's orders
router.get('/', getUserOrders);

// GET /api/user/orders/:orderId - Get specific order details for current user
router.get('/:orderId', getUserOrderById);

module.exports = router;
