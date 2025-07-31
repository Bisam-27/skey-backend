const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  getUserStats 
} = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All user management routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/users - Get all users with pagination and filtering (Admin only)
router.get('/', getAllUsers);

// GET /api/users/stats - Get user statistics (Admin only)
router.get('/stats', getUserStats);

// GET /api/users/:id - Get specific user by ID (Admin only)
router.get('/:id', getUserById);

module.exports = router;
