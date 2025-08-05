const { Op } = require('sequelize');
const Coupon = require('../models/coupon');
const Product = require('../models/product');
const Category = require('../models/category');
const CouponUsage = require('../models/couponUsage');
const sequelize = require('../config/db');

// Create a new coupon (Vendor only for their own products)
const createVendorCoupon = async (req, res) => {
  try {
    console.log('Creating vendor coupon with data:', req.body);

    const {
      code,
      product_type,
      collection_id,
      product_id,
      coupon_type,
      discount_value,
      expiration_date,
      usage_limit,
      minimum_order_amount
    } = req.body;

    // Validate required fields
    if (!code || !product_type || !coupon_type || !discount_value || !expiration_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: code, product_type, coupon_type, discount_value, expiration_date'
      });
    }

    // Validate product_type specific requirements
    if (product_type === 'collection' && !collection_id) {
      return res.status(400).json({
        success: false,
        message: 'Collection ID is required when product type is collection'
      });
    }

    if (product_type === 'product' && !product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required when product type is product'
      });
    }

    // Validate coupon type and discount value
    if (coupon_type === 'discount' && (discount_value <= 0 || discount_value > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Discount percentage must be between 1 and 100'
      });
    }

    if (coupon_type === 'flat_off' && discount_value <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Flat off amount must be greater than 0'
      });
    }

    // Validate expiration date
    const expirationDate = new Date(expiration_date);
    if (expirationDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiration date must be in the future'
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({
      where: { code: code.toUpperCase() }
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    // If product_type is 'product', verify the product belongs to this vendor
    if (product_type === 'product') {
      const product = await Product.findOne({
        where: { 
          id: product_id,
          vendor_id: req.user.id
        }
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Product not found or does not belong to this vendor'
        });
      }
    }

    // Create the coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      vendor_id: req.user.id,
      product_type,
      collection_id: product_type === 'collection' ? collection_id : null,
      product_id: product_type === 'product' ? product_id : null,
      coupon_type,
      discount_value,
      expiration_date,
      usage_limit: usage_limit || null,
      minimum_order_amount: minimum_order_amount || null
    });

    // Fetch the created coupon with associations
    const createdCoupon = await Coupon.findByPk(coupon.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price']
        },
        {
          model: Category,
          as: 'collection',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: createdCoupon
    });

  } catch (error) {
    console.error('Create vendor coupon error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + error.errors.map(e => e.message).join(', ')
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all coupons for the authenticated vendor
const getVendorCoupons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      coupon_type = '',
      is_active = '',
      product_type = ''
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const whereClause = {
      vendor_id: req.user.id
    };

    if (search) {
      whereClause.code = { [Op.like]: `%${search.toUpperCase()}%` };
    }

    if (coupon_type) {
      whereClause.coupon_type = coupon_type;
    }

    if (is_active !== '') {
      whereClause.is_active = is_active === 'true';
    }

    if (product_type) {
      whereClause.product_type = product_type;
    }

    const { count, rows: coupons } = await Coupon.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price']
        },
        {
          model: Category,
          as: 'collection',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(count / limitNum),
          total_items: count,
          items_per_page: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get vendor coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get vendor's products for coupon creation
const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { vendor_id: req.user.id },
      attributes: ['id', 'name', 'price'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all collections for coupon creation
const getCollections = async (req, res) => {
  try {
    const collections = await Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: collections
    });

  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single coupon details (vendor can only see their own coupons)
const getCouponDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findOne({
      where: { 
        id: id,
        vendor_id: req.user.id
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price']
        },
        {
          model: Category,
          as: 'collection',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Get usage statistics
    const usageStats = await CouponUsage.findAll({
      where: { coupon_id: id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_uses'],
        [sequelize.fn('SUM', sequelize.col('discount_amount')), 'total_discount_given']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        coupon,
        stats: {
          total_uses: parseInt(usageStats[0]?.total_uses || 0),
          total_discount_given: parseFloat(usageStats[0]?.total_discount_given || 0)
        }
      }
    });

  } catch (error) {
    console.error('Get coupon details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update coupon (vendor can only update their own coupons)
const updateVendorCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      discount_value,
      expiration_date,
      usage_limit,
      minimum_order_amount,
      is_active
    } = req.body;

    const coupon = await Coupon.findOne({
      where: {
        id: id,
        vendor_id: req.user.id
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Validate discount value if provided
    if (discount_value !== undefined) {
      if (coupon.coupon_type === 'discount' && (discount_value <= 0 || discount_value > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Discount percentage must be between 1 and 100'
        });
      }

      if (coupon.coupon_type === 'flat_off' && discount_value <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Flat off amount must be greater than 0'
        });
      }
    }

    // Validate expiration date if provided
    if (expiration_date) {
      const expirationDate = new Date(expiration_date);
      if (expirationDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Expiration date must be in the future'
        });
      }
    }

    // Update the coupon
    const updateData = {};
    if (discount_value !== undefined) updateData.discount_value = discount_value;
    if (expiration_date) updateData.expiration_date = expiration_date;
    if (usage_limit !== undefined) updateData.usage_limit = usage_limit;
    if (minimum_order_amount !== undefined) updateData.minimum_order_amount = minimum_order_amount;
    if (is_active !== undefined) updateData.is_active = is_active;

    await coupon.update(updateData);

    // Fetch updated coupon with associations
    const updatedCoupon = await Coupon.findByPk(coupon.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price']
        },
        {
          model: Category,
          as: 'collection',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: updatedCoupon
    });

  } catch (error) {
    console.error('Update vendor coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete coupon (vendor can only delete their own coupons)
const deleteVendorCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findOne({
      where: {
        id: id,
        vendor_id: req.user.id
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if coupon has been used
    const usageCount = await CouponUsage.count({
      where: { coupon_id: id }
    });

    if (usageCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete coupon that has been used. You can deactivate it instead.'
      });
    }

    await coupon.destroy();

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    console.error('Delete vendor coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get vendor coupon statistics
const getVendorCouponStats = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get total coupons count
    const totalCoupons = await Coupon.count({
      where: { vendor_id: vendorId }
    });

    // Get active coupons count
    const activeCoupons = await Coupon.count({
      where: {
        vendor_id: vendorId,
        is_active: true,
        expiration_date: { [Op.gt]: new Date() }
      }
    });

    // Get expired coupons count
    const expiredCoupons = await Coupon.count({
      where: {
        vendor_id: vendorId,
        expiration_date: { [Op.lte]: new Date() }
      }
    });

    // Get total usage statistics
    const usageStats = await CouponUsage.findAll({
      include: [{
        model: Coupon,
        as: 'coupon',
        where: { vendor_id: vendorId },
        attributes: []
      }],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('CouponUsage.id')), 'total_uses'],
        [sequelize.fn('SUM', sequelize.col('discount_amount')), 'total_discount_given']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        total_coupons: totalCoupons,
        active_coupons: activeCoupons,
        expired_coupons: expiredCoupons,
        inactive_coupons: totalCoupons - activeCoupons - expiredCoupons,
        total_uses: parseInt(usageStats[0]?.total_uses || 0),
        total_discount_given: parseFloat(usageStats[0]?.total_discount_given || 0)
      }
    });

  } catch (error) {
    console.error('Get vendor coupon stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createVendorCoupon,
  getVendorCoupons,
  getVendorProducts,
  getCollections,
  getCouponDetails,
  updateVendorCoupon,
  deleteVendorCoupon,
  getVendorCouponStats
};
