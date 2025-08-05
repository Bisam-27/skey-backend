const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminDashboardController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin dashboard routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/dashboard/stats - Get dashboard statistics (Admin only)
router.get('/stats', getDashboardStats);

module.exports = router;
