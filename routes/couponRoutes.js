const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getVendorCoupons,
  getVendorProducts,
  getCollections,
  getCouponDetails,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} = require('../controllers/couponController');
const {
  getVendorCouponUsage,
  getCouponAnalytics
} = require('../controllers/couponUsageController');
const { authenticateToken, requireVendor } = require('../middleware/auth');

// Vendor routes (require vendor authentication)
router.post('/', authenticateToken, requireVendor, createCoupon);
router.get('/vendor/coupons', authenticateToken, requireVendor, getVendorCoupons);
router.get('/vendor/products', authenticateToken, requireVendor, getVendorProducts);
router.get('/collections', authenticateToken, requireVendor, getCollections);
router.get('/:id', authenticateToken, requireVendor, getCouponDetails);
router.put('/:id', authenticateToken, requireVendor, updateCoupon);
router.delete('/:id', authenticateToken, requireVendor, deleteCoupon);

// Vendor analytics and usage routes
router.get('/vendor/usage', authenticateToken, requireVendor, getVendorCouponUsage);
router.get('/vendor/analytics', authenticateToken, requireVendor, getCouponAnalytics);

// Customer routes (require user authentication)
router.post('/validate', authenticateToken, validateCoupon);

module.exports = router;
