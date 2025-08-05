const express = require('express');
const router = express.Router();
const {
  createVendorCoupon,
  getVendorCoupons,
  getVendorProducts,
  getCollections,
  getCouponDetails,
  updateVendorCoupon,
  deleteVendorCoupon,
  getVendorCouponStats
} = require('../controllers/vendorCouponController');
const { authenticateToken, requireVendor } = require('../middleware/auth');

// All vendor coupon routes require authentication and vendor role
router.use(authenticateToken);
router.use(requireVendor);

// GET /api/vendor/coupons/collections - Get all collections for coupon creation
router.get('/collections', getCollections);

// GET /api/vendor/coupons/products - Get vendor's products for coupon creation
router.get('/products', getVendorProducts);

// GET /api/vendor/coupons/stats - Get vendor coupon statistics
router.get('/stats', getVendorCouponStats);

// GET /api/vendor/coupons - Get all coupons for the authenticated vendor
router.get('/', getVendorCoupons);

// POST /api/vendor/coupons - Create new coupon for the authenticated vendor
router.post('/', createVendorCoupon);

// GET /api/vendor/coupons/:id - Get single coupon details
router.get('/:id', getCouponDetails);

// PUT /api/vendor/coupons/:id - Update coupon
router.put('/:id', updateVendorCoupon);

// DELETE /api/vendor/coupons/:id - Delete coupon
router.delete('/:id', deleteVendorCoupon);

module.exports = router;
