const Product = require('../models/product');
const Subcategory = require('../models/subcategory');
const Category = require('../models/category');
const { Op } = require('sequelize');

// Get all products for the authenticated vendor
const getVendorProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      search = ''
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const whereClause = {
      vendor_id: vendorId // Only show products owned by this vendor
    };

    if (category) {
      whereClause.subcategory_id = category;
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseInt(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseInt(maxPrice);
    }

    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`
      };
    }

    // Validate sort parameters
    const validSortFields = ['id', 'name', 'price', 'stock', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name', 'short_name', 'category_id'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug']
            }
          ]
        }
      ],
      limit: limitNum,
      offset: offset,
      order: [[finalSortBy, finalSortOrder]],
      distinct: true
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      success: true,
      message: 'Vendor products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalProducts: count,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single product by ID (only if owned by vendor)
const getVendorProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    const product = await Product.findOne({
      where: {
        id,
        vendor_id: vendorId // Ensure vendor can only access their own products
      },
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name', 'short_name', 'category_id'],
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug']
            }
          ]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied',
        error: 'Product with this ID does not exist or you do not have permission to access it'
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });

  } catch (error) {
    console.error('Get vendor product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new product for vendor
const createVendorProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      name,
      brand_id,
      short_name,
      stock = 0,
      description,
      specification,
      price,
      discount = 0,
      size,
      color,
      material,
      catalogue_url,
      fit_type,
      sleeve_type,
      pattern,
      occassion,
      subcategory_id
    } = req.body;

    // Handle uploaded images - store the full server URL path
    const uploadedImages = {};
    if (req.files) {
      // Process each uploaded image
      for (let i = 1; i <= 8; i++) {
        const fieldName = `image_${i}`;
        if (req.files[fieldName] && req.files[fieldName][0]) {
          const file = req.files[fieldName][0];
          // Use the server URL from middleware
          uploadedImages[`image_${i}_url`] = file.serverUrl;
        }
      }
    }

    // Input validation
    if (!name || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required fields',
        error: 'Missing required fields'
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
        error: 'Invalid price value'
      });
    }

    if (discount && (discount < 0 || discount > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Discount must be between 0 and 100',
        error: 'Invalid discount value'
      });
    }

    if (stock && stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative',
        error: 'Invalid stock value'
      });
    }

    // Create product with vendor_id
    const product = await Product.create({
      name: name.trim(),
      brand_id: brand_id ? parseInt(brand_id) : null,
      short_name: short_name?.trim(),
      stock: parseInt(stock) || 0,
      description: description?.trim(),
      specification: specification?.trim(),
      price: parseInt(price),
      discount: parseInt(discount) || 0,
      size: size?.trim(),
      color: color?.trim(),
      image_1_url: uploadedImages.image_1_url,
      image_2_url: uploadedImages.image_2_url,
      image_3_url: uploadedImages.image_3_url,
      img_url: uploadedImages.image_4_url,
      img_4_url: uploadedImages.image_5_url,
      material: material?.trim(),
      catalogue_url: catalogue_url?.trim(),
      fit_type: fit_type?.trim(),
      sleeve_type: sleeve_type?.trim(),
      pattern: pattern?.trim(),
      occassion: occassion?.trim(),
      subcategory_id: subcategory_id ? parseInt(subcategory_id) : null,
      vendor_id: vendorId, // Associate product with vendor
      created_at: new Date()
    });

    // Fetch the created product with associations
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name', 'short_name'] // Changed slug to short_name
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: createdProduct }
    });

  } catch (error) {
    console.error('Create vendor product error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update product (only if owned by vendor)
const updateVendorProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    const updateData = req.body;

    // Handle uploaded images - store the full server URL path
    const uploadedImages = {};
    if (req.files) {
      // Process each uploaded image
      for (let i = 1; i <= 8; i++) {
        const fieldName = `image_${i}`;
        if (req.files[fieldName] && req.files[fieldName][0]) {
          const file = req.files[fieldName][0];
          // Use the server URL from middleware
          uploadedImages[`image_${i}_url`] = file.serverUrl;
        }
      }
    }

    const product = await Product.findOne({
      where: {
        id,
        vendor_id: vendorId // Ensure vendor can only update their own products
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied',
        error: 'Product with this ID does not exist or you do not have permission to update it'
      });
    }

    // Merge uploaded images with update data
    Object.assign(updateData, uploadedImages);

    // Remove undefined values and trim strings
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      } else if (typeof updateData[key] === 'string') {
        updateData[key] = updateData[key].trim();
      }
    });

    // Validate price if provided
    if (updateData.price !== undefined && updateData.price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
        error: 'Invalid price value'
      });
    }

    // Validate discount if provided
    if (updateData.discount !== undefined && (updateData.discount < 0 || updateData.discount > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Discount must be between 0 and 100',
        error: 'Invalid discount value'
      });
    }

    // Validate stock if provided
    if (updateData.stock !== undefined && updateData.stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative',
        error: 'Invalid stock value'
      });
    }

    // Don't allow vendor_id to be changed
    delete updateData.vendor_id;

    await product.update(updateData);

    // Fetch updated product with associations
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name', 'short_name'] // Changed slug to short_name
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });

  } catch (error) {
    console.error('Update vendor product error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete product (only if owned by vendor)
const deleteVendorProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    const product = await Product.findOne({
      where: {
        id,
        vendor_id: vendorId // Ensure vendor can only delete their own products
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied',
        error: 'Product with this ID does not exist or you do not have permission to delete it'
      });
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: { deletedProductId: id }
    });

  } catch (error) {
    console.error('Delete vendor product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getVendorProducts,
  getVendorProductById,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct
};
