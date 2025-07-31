const { Coupon, Product, Category, User, CouponUsage } = require('../models/associations');
const { Op } = require('sequelize');

// Create a new coupon (Admin can create for any vendor)
const createAdminCoupon = async (req, res) => {
  try {
    console.log('Creating admin coupon with data:', req.body);

    const {
      code,
      vendor_id,
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
    if (!code || !vendor_id || !product_type || !coupon_type || !discount_value || !expiration_date) {
      console.log('Missing required fields:', { code, vendor_id, product_type, coupon_type, discount_value, expiration_date });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: code, vendor_id, product_type, coupon_type, discount_value, expiration_date'
      });
    }

    // Validate vendor exists
    const vendor = await User.findOne({
      where: { id: vendor_id, role: 'vendor' }
    });

    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor ID'
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

    // Validate collection exists if specified
    if (collection_id) {
      const collection = await Category.findByPk(collection_id);
      if (!collection) {
        return res.status(400).json({
          success: false,
          message: 'Invalid collection ID'
        });
      }
    }

    // Validate product exists and belongs to the specified vendor if specified
    if (product_id) {
      const product = await Product.findOne({
        where: { id: product_id, vendor_id: vendor_id }
      });
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID or product does not belong to the specified vendor'
        });
      }
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

    // Create the coupon
    console.log('Creating coupon with data:', {
      code: code.toUpperCase(),
      vendor_id: vendor_id,
      product_type,
      collection_id: product_type === 'collection' ? collection_id : null,
      product_id: product_type === 'product' ? product_id : null,
      coupon_type,
      discount_value,
      expiration_date,
      usage_limit,
      minimum_order_amount
    });

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      vendor_id: vendor_id,
      product_type,
      collection_id: product_type === 'collection' ? collection_id : null,
      product_id: product_type === 'product' ? product_id : null,
      coupon_type,
      discount_value,
      expiration_date,
      usage_limit,
      minimum_order_amount
    });

    console.log('Coupon created with ID:', coupon.id);

    // Fetch the created coupon with associations
    const createdCoupon = await Coupon.findByPk(coupon.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price'],
          required: false
        },
        {
          model: Category,
          as: 'collection',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'email'],
          required: false
        }
      ]
    });

    console.log('Coupon created successfully:', createdCoupon.toJSON());

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: createdCoupon
    });

  } catch (error) {
    console.error('Create admin coupon error:', error);
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

// Get all coupons (Admin can see all coupons)
const getAllCoupons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      vendor_id = '',
      coupon_type = '',
      is_active = '',
      product_type = ''
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const whereClause = {};

    if (search) {
      whereClause.code = { [Op.like]: `%${search.toUpperCase()}%` };
    }

    if (vendor_id) {
      whereClause.vendor_id = vendor_id;
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
          attributes: ['id', 'name', 'price'],
          required: false
        },
        {
          model: Category,
          as: 'collection',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'email'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_items: count,
          items_per_page: limitNum,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all vendors for coupon creation
const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.findAll({
      where: {
        role: 'vendor'
      },
      attributes: ['id', 'email'],
      order: [['email', 'ASC']]
    });

    res.json({
      success: true,
      data: vendors
    });

  } catch (error) {
    console.error('Get all vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single coupon details (Admin can see any coupon)
const getCouponDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id, {
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
          model: User,
          as: 'vendor',
          attributes: ['id', 'email']
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

// Update coupon (Admin can update any coupon)
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

    const coupon = await Coupon.findByPk(id);

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

    // Update coupon
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
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'email']
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

// Delete coupon (Admin can delete any coupon)
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);

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

module.exports = {
  createAdminCoupon,
  getAllCoupons,
  getAllVendors,
  getCouponDetails,
  updateCoupon,
  deleteCoupon
};
