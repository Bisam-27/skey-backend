const express = require('express');
const router = express.Router();
const {
  // Banner management
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannerById,
  // Testimonial management
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialById,
  // Feature management
  getAllFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
  getFeatureById
} = require('../controllers/adminHomepageController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin homepage routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// ==================== BANNER ROUTES ====================

// GET /api/admin/homepage/banners - Get all banners with filtering and pagination
router.get('/banners', getAllBanners);

// POST /api/admin/homepage/banners - Create new banner
router.post('/banners', createBanner);

// GET /api/admin/homepage/banners/:id - Get single banner
router.get('/banners/:id', getBannerById);

// PUT /api/admin/homepage/banners/:id - Update banner
router.put('/banners/:id', updateBanner);

// DELETE /api/admin/homepage/banners/:id - Delete banner
router.delete('/banners/:id', deleteBanner);

// ==================== TESTIMONIAL ROUTES ====================

// GET /api/admin/homepage/testimonials - Get all testimonials with filtering and pagination
router.get('/testimonials', getAllTestimonials);

// POST /api/admin/homepage/testimonials - Create new testimonial
router.post('/testimonials', createTestimonial);

// GET /api/admin/homepage/testimonials/:id - Get single testimonial
router.get('/testimonials/:id', getTestimonialById);

// PUT /api/admin/homepage/testimonials/:id - Update testimonial
router.put('/testimonials/:id', updateTestimonial);

// DELETE /api/admin/homepage/testimonials/:id - Delete testimonial
router.delete('/testimonials/:id', deleteTestimonial);

// ==================== FEATURE ROUTES ====================

// GET /api/admin/homepage/features - Get all features with filtering and pagination
router.get('/features', getAllFeatures);

// POST /api/admin/homepage/features - Create new feature
router.post('/features', createFeature);

// GET /api/admin/homepage/features/:id - Get single feature
router.get('/features/:id', getFeatureById);

// PUT /api/admin/homepage/features/:id - Update feature
router.put('/features/:id', updateFeature);

// DELETE /api/admin/homepage/features/:id - Delete feature
router.delete('/features/:id', deleteFeature);

module.exports = router;
