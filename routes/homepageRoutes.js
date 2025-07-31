const express = require('express');
const router = express.Router();
const {
  getHomepageContent,
  getHeroBanners,
  getPromotionalBanners,
  getAnnouncements,
  getFeaturedTestimonials,
  getFeatures
} = require('../controllers/homepageController');

// GET /api/homepage - Get all homepage content in one call
router.get('/', getHomepageContent);

// GET /api/homepage/banners/hero - Get hero banners
router.get('/banners/hero', getHeroBanners);

// GET /api/homepage/banners/promotional - Get promotional banners
router.get('/banners/promotional', getPromotionalBanners);

// GET /api/homepage/announcements - Get announcements
router.get('/announcements', getAnnouncements);

// GET /api/homepage/testimonials - Get featured testimonials
router.get('/testimonials', getFeaturedTestimonials);

// GET /api/homepage/features - Get why choose us features
router.get('/features', getFeatures);

module.exports = router;
