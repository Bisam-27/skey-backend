const express = require('express');
const router = express.Router();
const {
  createAdminCoupon,
  getAllCoupons,
  getAllVendors,
  getCouponDetails,
  updateCoupon,
  deleteCoupon
} = require('../controllers/adminCouponController');
const {
  getCollections,
  getAllProductsForCoupons
} = require('../controllers/couponController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin coupon routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/coupons/vendors - Get all vendors for coupon creation
router.get('/vendors', getAllVendors);

// GET /api/admin/coupons/collections - Get all collections for coupon creation
router.get('/collections', getCollections);

// GET /api/admin/coupons/products - Get all products for coupon creation
router.get('/products', getAllProductsForCoupons);

// GET /api/admin/coupons - Get all coupons with filtering and pagination
router.get('/', getAllCoupons);

// POST /api/admin/coupons - Create new coupon
router.post('/', createAdminCoupon);

// GET /api/admin/coupons/:id - Get single coupon details
router.get('/:id', getCouponDetails);

// PUT /api/admin/coupons/:id - Update coupon
router.put('/:id', updateCoupon);

// DELETE /api/admin/coupons/:id - Delete coupon
router.delete('/:id', deleteCoupon);

module.exports = router;
