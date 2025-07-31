const Banner = require('../models/banner');
const Testimonial = require('../models/testimonial');
const Feature = require('../models/feature');
const Category = require('../models/category');
const Product = require('../models/product');
const { Op } = require('sequelize');

// Get all homepage content in one API call
const getHomepageContent = async (req, res) => {
  try {
    const now = new Date();

    // Get active hero banners
    const heroBanners = await Banner.findAll({
      where: {
        type: 'hero',
        is_active: true,
        [Op.or]: [
          { start_date: null },
          { start_date: { [Op.lte]: now } }
        ],
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: now } }
        ]
      },
      order: [['position', 'ASC']],
      attributes: ['id', 'title', 'subtitle', 'description', 'image_url', 'mobile_image_url', 'link_url', 'link_text', 'background_color', 'text_color']
    });

    // Get active promotional banners
    const promotionalBanners = await Banner.findAll({
      where: {
        type: 'promotional',
        is_active: true,
        [Op.or]: [
          { start_date: null },
          { start_date: { [Op.lte]: now } }
        ],
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: now } }
        ]
      },
      order: [['position', 'ASC']],
      attributes: ['id', 'title', 'subtitle', 'description', 'image_url', 'mobile_image_url', 'link_url', 'link_text', 'background_color', 'text_color']
    });

    // Get active announcements
    const announcements = await Banner.findAll({
      where: {
        type: 'announcement',
        is_active: true,
        [Op.or]: [
          { start_date: null },
          { start_date: { [Op.lte]: now } }
        ],
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: now } }
        ]
      },
      order: [['position', 'ASC']],
      attributes: ['id', 'title', 'subtitle', 'link_url', 'link_text', 'background_color', 'text_color']
    });

    // Get featured categories (top 12)
    const featuredCategories = await Category.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']],
      limit: 12,
      attributes: ['id', 'name', 'slug', 'description', 'image_url']
    });

    // Get featured testimonials
    const testimonials = await Testimonial.findAll({
      where: {
        is_featured: true,
        is_active: true
      },
      order: [['position', 'ASC']],
      limit: 6,
      attributes: ['id', 'name', 'rating', 'review', 'image_url', 'location', 'is_verified']
    });

    // Get why choose us features
    const features = await Feature.findAll({
      where: {
        type: 'why_choose_us',
        is_active: true
      },
      order: [['position', 'ASC']],
      attributes: ['id', 'title', 'description', 'icon_url', 'icon_class', 'background_color', 'text_color']
    });

    res.status(200).json({
      success: true,
      data: {
        heroBanners,
        promotionalBanners,
        announcements,
        featuredCategories,
        testimonials,
        features
      }
    });

  } catch (error) {
    console.error('Get homepage content error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching homepage content'
    });
  }
};

// Get hero banners only
const getHeroBanners = async (req, res) => {
  try {
    const now = new Date();

    const banners = await Banner.findAll({
      where: {
        type: 'hero',
        is_active: true,
        [Op.or]: [
          { start_date: null },
          { start_date: { [Op.lte]: now } }
        ],
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: now } }
        ]
      },
      order: [['position', 'ASC']],
      attributes: ['id', 'title', 'subtitle', 'description', 'image_url', 'mobile_image_url', 'link_url', 'link_text', 'background_color', 'text_color']
    });

    res.status(200).json({
      success: true,
      data: { banners }
    });

  } catch (error) {
    console.error('Get hero banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching hero banners'
    });
  }
};

// Get promotional banners only
const getPromotionalBanners = async (req, res) => {
  try {
    const now = new Date();

    const banners = await Banner.findAll({
      where: {
        type: 'promotional',
        is_active: true,
        [Op.or]: [
          { start_date: null },
          { start_date: { [Op.lte]: now } }
        ],
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: now } }
        ]
      },
      order: [['position', 'ASC']],
      attributes: ['id', 'title', 'subtitle', 'description', 'image_url', 'mobile_image_url', 'link_url', 'link_text', 'background_color', 'text_color']
    });

    res.status(200).json({
      success: true,
      data: { banners }
    });

  } catch (error) {
    console.error('Get promotional banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching promotional banners'
    });
  }
};

// Get announcements only
const getAnnouncements = async (req, res) => {
  try {
    const now = new Date();

    const announcements = await Banner.findAll({
      where: {
        type: 'announcement',
        is_active: true,
        [Op.or]: [
          { start_date: null },
          { start_date: { [Op.lte]: now } }
        ],
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: now } }
        ]
      },
      order: [['position', 'ASC']],
      attributes: ['id', 'title', 'subtitle', 'link_url', 'link_text', 'background_color', 'text_color']
    });

    res.status(200).json({
      success: true,
      data: { announcements }
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching announcements'
    });
  }
};

// Get featured testimonials
const getFeaturedTestimonials = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const testimonials = await Testimonial.findAll({
      where: {
        is_featured: true,
        is_active: true
      },
      order: [['position', 'ASC']],
      limit: Math.min(20, parseInt(limit)),
      attributes: ['id', 'name', 'rating', 'review', 'image_url', 'location', 'is_verified']
    });

    res.status(200).json({
      success: true,
      data: { testimonials }
    });

  } catch (error) {
    console.error('Get featured testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching testimonials'
    });
  }
};

// Get why choose us features
const getFeatures = async (req, res) => {
  try {
    const { type = 'why_choose_us' } = req.query;

    const features = await Feature.findAll({
      where: {
        type: type,
        is_active: true
      },
      order: [['position', 'ASC']],
      attributes: ['id', 'title', 'description', 'icon_url', 'icon_class', 'background_color', 'text_color']
    });

    res.status(200).json({
      success: true,
      data: { features }
    });

  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching features'
    });
  }
};

module.exports = {
  getHomepageContent,
  getHeroBanners,
  getPromotionalBanners,
  getAnnouncements,
  getFeaturedTestimonials,
  getFeatures
};
