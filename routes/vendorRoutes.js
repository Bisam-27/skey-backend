const express = require('express');
const router = express.Router();
const {
  registerVendor,
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorStats
} = require('../controllers/vendorController');
const { authenticateToken, requireVendor } = require('../middleware/auth');

// Public vendor routes (no authentication required)
router.post('/register', registerVendor);
router.post('/login', loginVendor);

// Protected vendor routes (require authentication and vendor role)
router.use(authenticateToken);
router.use(requireVendor);

// GET /api/vendor/profile - Get vendor profile
router.get('/profile', getVendorProfile);

// PUT /api/vendor/profile - Update vendor profile
router.put('/profile', updateVendorProfile);

// GET /api/vendor/stats - Get vendor statistics
router.get('/stats', getVendorStats);

module.exports = router;
