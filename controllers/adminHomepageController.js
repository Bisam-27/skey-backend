const Banner = require('../models/banner');
const Testimonial = require('../models/testimonial');
const Feature = require('../models/feature');
const { Op } = require('sequelize');

// ==================== BANNER MANAGEMENT ====================

// Get all banners (Admin only)
const getAllBanners = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type = '', 
      is_active = '', 
      sortBy = 'position', 
      sortOrder = 'ASC' 
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {};
    if (type && ['hero', 'promotional', 'announcement'].includes(type)) {
      whereClause.type = type;
    }
    if (is_active !== '') {
      whereClause.is_active = is_active === 'true';
    }

    // Validate sort parameters
    const validSortFields = ['id', 'title', 'type', 'position', 'is_active', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'position';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const { count, rows: banners } = await Banner.findAndCountAll({
      where: whereClause,
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: {
        banners,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalBanners: count,
          bannersPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching banners'
    });
  }
};

// Create new banner (Admin only)
const createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      image_url,
      mobile_image_url,
      link_url,
      link_text,
      type = 'hero',
      position = 0,
      is_active = true,
      start_date,
      end_date,
      background_color,
      text_color
    } = req.body;

    // Validation
    if (!title || !image_url) {
      return res.status(400).json({
        success: false,
        message: 'Title and image URL are required'
      });
    }

    if (!['hero', 'promotional', 'announcement'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be hero, promotional, or announcement'
      });
    }

    // Validate dates
    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      description,
      image_url,
      mobile_image_url,
      link_url,
      link_text,
      type,
      position: parseInt(position),
      is_active,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
      background_color,
      text_color
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: { banner }
    });

  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating banner'
    });
  }
};

// Update banner (Admin only)
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid banner ID is required'
      });
    }

    const banner = await Banner.findByPk(parseInt(id));
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Validate type if provided
    if (updateData.type && !['hero', 'promotional', 'announcement'].includes(updateData.type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be hero, promotional, or announcement'
      });
    }

    // Validate dates if provided
    const startDate = updateData.start_date ? new Date(updateData.start_date) : banner.start_date;
    const endDate = updateData.end_date ? new Date(updateData.end_date) : banner.end_date;
    
    if (startDate && endDate && startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    // Update banner
    await banner.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: { banner }
    });

  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating banner'
    });
  }
};

// Delete banner (Admin only)
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid banner ID is required'
      });
    }

    const banner = await Banner.findByPk(parseInt(id));
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    await banner.destroy();

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });

  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting banner'
    });
  }
};

// Get single banner (Admin only)
const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid banner ID is required'
      });
    }

    const banner = await Banner.findByPk(parseInt(id));
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { banner }
    });

  } catch (error) {
    console.error('Get banner by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching banner'
    });
  }
};

// ==================== TESTIMONIAL MANAGEMENT ====================

// Get all testimonials (Admin only)
const getAllTestimonials = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      is_featured = '',
      is_active = '',
      rating = '',
      sortBy = 'position',
      sortOrder = 'ASC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {};
    if (is_featured !== '') {
      whereClause.is_featured = is_featured === 'true';
    }
    if (is_active !== '') {
      whereClause.is_active = is_active === 'true';
    }
    if (rating && !isNaN(parseInt(rating))) {
      whereClause.rating = parseInt(rating);
    }

    // Validate sort parameters
    const validSortFields = ['id', 'name', 'rating', 'position', 'is_featured', 'is_active', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'position';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const { count, rows: testimonials } = await Testimonial.findAndCountAll({
      where: whereClause,
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: {
        testimonials,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalTestimonials: count,
          testimonialsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching testimonials'
    });
  }
};

// Create new testimonial (Admin only)
const createTestimonial = async (req, res) => {
  try {
    const {
      name,
      email,
      rating = 5,
      review,
      product_id,
      image_url,
      location,
      is_featured = false,
      is_verified = false,
      is_active = true,
      position = 0
    } = req.body;

    // Validation
    if (!name || !review) {
      return res.status(400).json({
        success: false,
        message: 'Name and review are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const testimonial = await Testimonial.create({
      name,
      email,
      rating: parseInt(rating),
      review,
      product_id: product_id ? parseInt(product_id) : null,
      image_url,
      location,
      is_featured,
      is_verified,
      is_active,
      position: parseInt(position)
    });

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: { testimonial }
    });

  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating testimonial'
    });
  }
};

// Update testimonial (Admin only)
const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid testimonial ID is required'
      });
    }

    const testimonial = await Testimonial.findByPk(parseInt(id));
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    // Validate rating if provided
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Validate email if provided
    if (updateData.email && !/\S+@\S+\.\S+/.test(updateData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    await testimonial.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: { testimonial }
    });

  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating testimonial'
    });
  }
};

// Delete testimonial (Admin only)
const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid testimonial ID is required'
      });
    }

    const testimonial = await Testimonial.findByPk(parseInt(id));
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    await testimonial.destroy();

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });

  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting testimonial'
    });
  }
};

// Get single testimonial (Admin only)
const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid testimonial ID is required'
      });
    }

    const testimonial = await Testimonial.findByPk(parseInt(id));
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { testimonial }
    });

  } catch (error) {
    console.error('Get testimonial by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching testimonial'
    });
  }
};

// ==================== FEATURE MANAGEMENT ====================

// Get all features (Admin only)
const getAllFeatures = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type = '',
      is_active = '',
      sortBy = 'position',
      sortOrder = 'ASC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {};
    if (type && ['why_choose_us', 'service', 'benefit'].includes(type)) {
      whereClause.type = type;
    }
    if (is_active !== '') {
      whereClause.is_active = is_active === 'true';
    }

    // Validate sort parameters
    const validSortFields = ['id', 'title', 'type', 'position', 'is_active', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'position';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const { count, rows: features } = await Feature.findAndCountAll({
      where: whereClause,
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: {
        features,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalFeatures: count,
          featuresPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all features error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching features'
    });
  }
};

// Create new feature (Admin only)
const createFeature = async (req, res) => {
  try {
    const {
      title,
      description,
      icon_url,
      icon_class,
      type = 'why_choose_us',
      position = 0,
      is_active = true,
      background_color,
      text_color
    } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    if (!['why_choose_us', 'service', 'benefit'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be why_choose_us, service, or benefit'
      });
    }

    const feature = await Feature.create({
      title,
      description,
      icon_url,
      icon_class,
      type,
      position: parseInt(position),
      is_active,
      background_color,
      text_color
    });

    res.status(201).json({
      success: true,
      message: 'Feature created successfully',
      data: { feature }
    });

  } catch (error) {
    console.error('Create feature error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating feature'
    });
  }
};

// Update feature (Admin only)
const updateFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid feature ID is required'
      });
    }

    const feature = await Feature.findByPk(parseInt(id));
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    // Validate type if provided
    if (updateData.type && !['why_choose_us', 'service', 'benefit'].includes(updateData.type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be why_choose_us, service, or benefit'
      });
    }

    await feature.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Feature updated successfully',
      data: { feature }
    });

  } catch (error) {
    console.error('Update feature error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating feature'
    });
  }
};

// Delete feature (Admin only)
const deleteFeature = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid feature ID is required'
      });
    }

    const feature = await Feature.findByPk(parseInt(id));
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    await feature.destroy();

    res.status(200).json({
      success: true,
      message: 'Feature deleted successfully'
    });

  } catch (error) {
    console.error('Delete feature error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting feature'
    });
  }
};

// Get single feature (Admin only)
const getFeatureById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid feature ID is required'
      });
    }

    const feature = await Feature.findByPk(parseInt(id));
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { feature }
    });

  } catch (error) {
    console.error('Get feature by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching feature'
    });
  }
};

module.exports = {
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
};
