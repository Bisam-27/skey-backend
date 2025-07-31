const Product = require('../models/product');
const Subcategory = require('../models/subcategory');
const Category = require('../models/category');
const User = require('../models/user');
const Brand = require('../models/brand');
const { Op } = require('sequelize');

// Get all products (Admin can see all products)
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      search = '',
      vendor_id
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const whereClause = {};

    if (category) {
      whereClause.subcategory_id = category;
    }

    if (subcategory) {
      whereClause.subcategory_id = subcategory;
    }

    if (vendor_id) {
      whereClause.vendor_id = vendor_id;
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseInt(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseInt(maxPrice);
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { short_name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build order clause
    const validSortFields = ['name', 'price', 'stock', 'created_at', 'discount'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name', 'short_name'], // Changed slug to short_name
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug'] // Category still has slug
            }
          ]
        }
      ],
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset,
      distinct: true
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single product by ID (Admin can see any product)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name', 'short_name'], // Changed slug to short_name
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug'] // Category still has slug
            }
          ]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'Product with this ID does not exist'
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new product (Admin can create products for any vendor or without vendor)
const createProduct = async (req, res) => {
  try {
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
      subcategory_id,
      vendor_id // Admin can assign products to specific vendors
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

    // Skip subcategory validation - make it completely optional
    // Subcategories are optional for admin product creation

    // Skip all foreign key validation - let database handle constraints
    // This allows admin to create products without strict validation

    // Create product data object
    const productData = {
      name: name.trim(),
      brand_id: brand_id || null,
      short_name: short_name?.trim(),
      stock: parseInt(stock) || 0,
      description: description?.trim(),
      specification: specification?.trim(),
      price: parseInt(price),
      discount: parseInt(discount) || 0,
      size: size?.trim(),
      color: color?.trim(),
      material: material?.trim(),
      catalogue_url: catalogue_url?.trim(),
      fit_type: fit_type?.trim(),
      sleeve_type: sleeve_type?.trim(),
      pattern: pattern?.trim(),
      occassion: occassion?.trim(),
      subcategory_id: subcategory_id || null,
      vendor_id: vendor_id || null, // Admin can assign to vendor
      created_at: new Date(),
      // Add uploaded image paths with full server URLs
      image_1_url: uploadedImages.image_1_url || null,
      image_2_url: uploadedImages.image_2_url || null,
      image_3_url: uploadedImages.image_3_url || null,
      img_url: uploadedImages.image_1_url || null, // Use first image as main image
      img_4_url: uploadedImages.image_4_url || null
    };

    const product = await Product.create(productData);

    // Log successful creation with image paths
    console.log('Product created successfully with ID:', product.id);
    if (Object.keys(uploadedImages).length > 0) {
      console.log('Image URLs stored:', uploadedImages);
    }

    // Fetch the created product with associations
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name', 'short_name'], // Changed slug to short_name
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug'] // Category still has slug
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: createdProduct }
    });

  } catch (error) {
    console.error('Create product error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('Request files:', req.files);

    // Log uploaded images for debugging
    if (req.files) {
      console.log('Uploaded files details:');
      Object.keys(req.files).forEach(fieldName => {
        const file = req.files[fieldName][0];
        console.log(`${fieldName}:`, {
          originalname: file.originalname,
          filename: file.filename,
          path: file.path,
          serverUrl: file.serverUrl
        });
      });
    }

    // Handle specific database errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      let message = 'Invalid reference data provided';
      if (error.message.includes('subcategory')) {
        message = 'Invalid subcategory selected. Please select a valid subcategory.';
      } else if (error.message.includes('brand')) {
        message = 'Invalid brand selected. Please select a valid brand.';
      } else if (error.message.includes('vendor')) {
        message = 'Invalid vendor selected. Please select a valid vendor.';
      }

      return res.status(400).json({
        success: false,
        message: message,
        error: 'Foreign key constraint violation'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update product (Admin can update any product)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'Product with this ID does not exist'
      });
    }

    // Handle uploaded images - store the full server URL path
    if (req.files) {
      // Process each uploaded image
      for (let i = 1; i <= 8; i++) {
        const fieldName = `image_${i}`;
        if (req.files[fieldName] && req.files[fieldName][0]) {
          const file = req.files[fieldName][0];
          // Use the server URL from middleware
          updateData[`image_${i}_url`] = file.serverUrl;

          // Update main image if it's the first image
          if (i === 1) {
            updateData.img_url = file.serverUrl;
          }
        }
      }
    }

    // Remove undefined values and trim strings
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      } else if (typeof updateData[key] === 'string') {
        updateData[key] = updateData[key].trim();
      }
    });

    // Validate numeric fields if they exist
    if (updateData.price !== undefined) {
      if (updateData.price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price cannot be negative',
          error: 'Invalid price value'
        });
      }
      updateData.price = parseInt(updateData.price);
    }

    if (updateData.discount !== undefined) {
      if (updateData.discount < 0 || updateData.discount > 100) {
        return res.status(400).json({
          success: false,
          message: 'Discount must be between 0 and 100',
          error: 'Invalid discount value'
        });
      }
      updateData.discount = parseInt(updateData.discount);
    }

    if (updateData.stock !== undefined) {
      if (updateData.stock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock cannot be negative',
          error: 'Invalid stock value'
        });
      }
      updateData.stock = parseInt(updateData.stock);
    }

    // Convert numeric fields
    if (updateData.brand_id) updateData.brand_id = parseInt(updateData.brand_id);
    if (updateData.subcategory_id) updateData.subcategory_id = parseInt(updateData.subcategory_id);
    if (updateData.vendor_id) updateData.vendor_id = parseInt(updateData.vendor_id);

    await product.update(updateData);

    // Fetch updated product with associations
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name', 'short_name'], // Changed slug to short_name
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug'] // Category still has slug
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete product (Admin can delete any product)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'Product with this ID does not exist'
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: { deletedProductId: id }
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all vendors (Admin can see all vendors)
const getAllVendors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      sortBy = 'email',
      sortOrder = 'ASC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const whereClause = {
      role: 'vendor'
    };

    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Valid sort fields (only fields that exist in the user table)
    const validSortFields = ['id', 'email'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'email';
    const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const { count, rows: vendors } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'email', 'role'],
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      success: true,
      message: 'Vendors retrieved successfully',
      data: {
        vendors,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
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

// Get all brands (Admin can see all brands)
const getAllBrands = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      sortBy = 'name',
      sortOrder = 'ASC',
      is_active = ''
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (is_active !== '') {
      whereClause.is_active = is_active === 'true';
    }

    // Valid sort fields
    const validSortFields = ['id', 'name', 'sort_order', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const { count, rows: brands } = await Brand.findAndCountAll({
      where: whereClause,
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      success: true,
      message: 'Brands retrieved successfully',
      data: {
        brands,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new brand (Admin only)
const createBrand = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      logo_url,
      website_url,
      is_active = true,
      sort_order = 0
    } = req.body;

    // Input validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required',
        error: 'Missing required fields'
      });
    }

    // Generate slug if not provided
    const brandSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const brandData = {
      name: name.trim(),
      slug: brandSlug,
      description: description?.trim(),
      logo_url: logo_url?.trim(),
      website_url: website_url?.trim(),
      is_active: Boolean(is_active),
      sort_order: parseInt(sort_order) || 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    const brand = await Brand.create(brandData);

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: { brand }
    });

  } catch (error) {
    console.error('Create brand error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Brand name or slug already exists',
        error: 'Duplicate entry'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllVendors,
  getAllBrands,
  createBrand
};
