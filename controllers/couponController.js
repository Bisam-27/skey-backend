const { Coupon, CouponUsage, Product, Category, User } = require('../models/associations');
const { Op } = require('sequelize');

// Create a new coupon (Vendor only)
const createCoupon = async (req, res) => {
  try {
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

    // If product_type is product, verify the product belongs to the vendor
    if (product_type === 'product') {
      const product = await Product.findOne({
        where: {
          id: product_id,
          vendor_id: req.userId
        }
      });

      if (!product) {
        return res.status(403).json({
          success: false,
          message: 'Product not found or you do not have permission to create coupons for this product'
        });
      }
    }

    // If product_type is collection, verify the collection exists
    if (product_type === 'collection') {
      const collection = await Category.findByPk(collection_id);
      if (!collection) {
        return res.status(400).json({
          success: false,
          message: 'Collection not found'
        });
      }
    }

    // Create the coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      vendor_id: req.userId,
      product_type,
      collection_id: product_type === 'collection' ? collection_id : null,
      product_id: product_type === 'product' ? product_id : null,
      coupon_type,
      discount_value,
      expiration_date,
      usage_limit,
      minimum_order_amount
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
    console.error('Create coupon error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all coupons for a vendor
const getVendorCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = { vendor_id: req.userId };

    if (status === 'active') {
      whereClause.is_active = true;
      whereClause.expiration_date = { [Op.gt]: new Date() };
    } else if (status === 'inactive') {
      whereClause[Op.or] = [
        { is_active: false },
        { expiration_date: { [Op.lte]: new Date() } }
      ];
    }

    if (search) {
      whereClause.code = { [Op.like]: `%${search}%` };
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
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
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
    const { search, category_id } = req.query;

    // Build where clause
    const whereClause = { vendor_id: req.userId };

    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    if (category_id) {
      whereClause.subcategory_id = category_id;
    }

    const products = await Product.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'price', 'stock', 'subcategory_id'],
      include: [
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'email']
        }
      ],
      order: [['name', 'ASC']],
      limit: 100 // Reasonable limit for dropdown
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

// Get collections/categories for coupon creation
const getCollections = async (req, res) => {
  try {
    const collections = await Category.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'slug'],
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

// Get all products for admin coupon creation (Admin only)
const getAllProductsForCoupons = async (req, res) => {
  try {
    const { search = '', category_id = '', vendor_id = '' } = req.query;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category_id) {
      whereClause.subcategory_id = category_id;
    }

    if (vendor_id) {
      whereClause.vendor_id = vendor_id;
    }

    const products = await Product.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'price', 'vendor_id', 'subcategory_id'],
      order: [['name', 'ASC']],
      limit: 100 // Limit for performance
    });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get all products for coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single coupon details
const getCouponDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findOne({
      where: {
        id,
        vendor_id: req.userId
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
        },
        {
          model: CouponUsage,
          as: 'usages',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ],
          order: [['used_at', 'DESC']],
          limit: 10
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
    const usageStats = await CouponUsage.getUsageStats(id);

    res.json({
      success: true,
      data: {
        coupon,
        stats: usageStats
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

// Update coupon
const updateCoupon = async (req, res) => {
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
        id,
        vendor_id: req.userId
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Update only allowed fields
    const updateData = {};
    if (discount_value !== undefined) updateData.discount_value = discount_value;
    if (expiration_date !== undefined) updateData.expiration_date = expiration_date;
    if (usage_limit !== undefined) updateData.usage_limit = usage_limit;
    if (minimum_order_amount !== undefined) updateData.minimum_order_amount = minimum_order_amount;
    if (is_active !== undefined) updateData.is_active = is_active;

    await coupon.update(updateData);

    // Fetch updated coupon with associations
    const updatedCoupon = await Coupon.findByPk(id, {
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
    console.error('Update coupon error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findOne({
      where: {
        id,
        vendor_id: req.userId
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
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Validate and apply coupon (for customers)
const validateCoupon = async (req, res) => {
  try {
    const { code, order_amount, product_ids = [] } = req.body;

    if (!code || !order_amount) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and order amount are required'
      });
    }

    const coupon = await Coupon.findOne({
      where: {
        code: code.toUpperCase(),
        is_active: true
      },
      include: [
        {
          model: Product,
          as: 'product'
        },
        {
          model: Category,
          as: 'collection'
        }
      ]
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon can be used
    if (!coupon.canBeUsed()) {
      let message = 'Coupon cannot be used';
      if (coupon.isExpired()) {
        message = 'Coupon has expired';
      } else if (coupon.isUsageLimitReached()) {
        message = 'Coupon usage limit reached';
      }

      return res.status(400).json({
        success: false,
        message
      });
    }

    // Check minimum order amount
    if (coupon.minimum_order_amount && order_amount < coupon.minimum_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimum_order_amount} required`
      });
    }

    // For product-specific coupons, check if the product is in the order
    if (coupon.product_type === 'product' && product_ids.length > 0) {
      if (!product_ids.includes(coupon.product_id)) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is only valid for specific products'
        });
      }
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(order_amount);

    res.json({
      success: true,
      message: 'Coupon is valid',
      data: {
        coupon_id: coupon.id,
        code: coupon.code,
        discount_amount: discountAmount,
        coupon_type: coupon.coupon_type,
        discount_value: coupon.discount_value,
        final_amount: order_amount - discountAmount
      }
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createCoupon,
  getVendorCoupons,
  getVendorProducts,
  getCollections,
  getAllProductsForCoupons,
  getCouponDetails,
  updateCoupon,
  deleteCoupon,
  validateCoupon
};
