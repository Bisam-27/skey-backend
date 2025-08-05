const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/google', authController.googleLogin);
router.post('/google/check', authController.checkGoogleUser);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
