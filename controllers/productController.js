const { Product, Category, Subcategory } = require('../models/associations');
const { Op } = require('sequelize');

const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      search = '',
      exclude = ''
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const whereClause = {};

    if (category) {
      whereClause.subcategory_id = category;
    }

    if (brand) {
      whereClause.brand_id = brand;
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseInt(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseInt(maxPrice);
    }

    // Exclude specific product (for related products)
    if (exclude) {
      whereClause.id = { [Op.ne]: parseInt(exclude) };
    }

    // Validate sort parameters
    const validSortFields = ['id', 'name', 'price', 'created_at', 'stock', 'discount'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Add search functionality
    if (search && search.trim()) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
        { short_name: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          include: [
            {
              model: Category,
              as: 'category'
            }
          ]
        }
      ],
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalProducts: count,
          productsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        filters: {
          sortBy: sortField,
          sortOrder: sortDirection,
          search: search || '',
          category,
          brand,
          minPrice,
          maxPrice
        }
      }
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products',
      error: err.message
    });
  }
};

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
      image_1_url,
      image_2_url,
      image_3_url,
      image_1_thumbnail,
      image_2_thumbnail,
      image_3_thumbnail,
      material,
      catalogue_url,
      fit_type,
      sleeve_type,
      pattern,
      occassion,
      img_url,
      img_4_url,
      subcategory_id
    } = req.body;

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

    const productData = {
      name: name.trim(),
      price: parseInt(price),
      brand_id: brand_id || null,
      short_name: short_name ? short_name.trim() : null,
      stock: parseInt(stock) || 0,
      description: description ? description.trim() : null,
      specification: specification ? specification.trim() : null,
      discount: parseInt(discount) || 0,
      size: size ? size.trim() : null,
      color: color ? color.trim() : null,
      image_1_url: image_1_url ? image_1_url.trim() : null,
      image_2_url: image_2_url ? image_2_url.trim() : null,
      image_3_url: image_3_url ? image_3_url.trim() : null,
      image_1_thumbnail: image_1_thumbnail ? image_1_thumbnail.trim() : null,
      image_2_thumbnail: image_2_thumbnail ? image_2_thumbnail.trim() : null,
      image_3_thumbnail: image_3_thumbnail ? image_3_thumbnail.trim() : null,
      material: material ? material.trim() : null,
      catalogue_url: catalogue_url ? catalogue_url.trim() : null,
      fit_type: fit_type ? fit_type.trim() : null,
      sleeve_type: sleeve_type ? sleeve_type.trim() : null,
      pattern: pattern ? pattern.trim() : null,
      occassion: occassion ? occassion.trim() : null,
      img_url: img_url ? img_url.trim() : null,
      img_4_url: img_4_url ? img_4_url.trim() : null,
      subcategory_id: subcategory_id || null,
      created_at: new Date()
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (err) {
    console.error('Error creating product:', err);

    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: err.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: err.message
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          include: [
            {
              model: Category,
              as: 'category'
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

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product',
      error: err.message
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'Product with this ID does not exist'
      });
    }

    // Remove undefined values and trim strings
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      } else if (typeof updateData[key] === 'string') {
        updateData[key] = updateData[key].trim();
      }
    });

    await product.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (err) {
    console.error('Error updating product:', err);

    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: err.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: err.message
    });
  }
};

// Delete product
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

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: { id: parseInt(id) }
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: err.message
    });
  }
};

// Search products with enhanced category search
const searchProducts = async (req, res) => {
  try {
    const {
      q = '',
      page = 1,
      limit = 12,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        error: 'Please provide a search term'
      });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;
    const searchTerm = q.trim();

    // Validate sort parameters
    const validSortFields = ['id', 'name', 'price', 'created_at', 'stock', 'discount'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // First, find matching categories and subcategories
    const categories = await Category.findAll({
      where: {
        name: { [Op.like]: `%${searchTerm}%` },
        is_active: true
      },
      include: [{
        model: Subcategory,
        as: 'subcategories',
        required: false
        // Removed is_active since subcategory table doesn't have this field
      }]
    });

    const subcategories = await Subcategory.findAll({
      where: {
        name: { [Op.like]: `%${searchTerm}%` }
        // Removed is_active since subcategory table doesn't have this field
      }
    });

    // Collect subcategory IDs from matching categories and subcategories
    let subcategoryIds = [];

    // Add subcategories from matching categories
    categories.forEach(category => {
      if (category.subcategories) {
        subcategoryIds.push(...category.subcategories.map(sub => sub.id));
      }
    });

    // Add directly matching subcategories
    subcategoryIds.push(...subcategories.map(sub => sub.id));

    // Remove duplicates
    subcategoryIds = [...new Set(subcategoryIds)];

    // Build search conditions
    const searchConditions = {
      [Op.or]: [
        // Search in product fields
        { name: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { short_name: { [Op.like]: `%${searchTerm}%` } }
      ]
    };

    // Add category/subcategory matches if found
    if (subcategoryIds.length > 0) {
      searchConditions[Op.or].push({ subcategory_id: { [Op.in]: subcategoryIds } });
    }

    // Search for products
    const { count, rows: products } = await Product.findAndCountAll({
      where: searchConditions,
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          include: [
            {
              model: Category,
              as: 'category'
            }
          ]
        }
      ],
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalProducts: count,
          productsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        searchQuery: q.trim(),
        filters: {
          sortBy: sortField,
          sortOrder: sortDirection
        }
      }
    });
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: err.message
    });
  }
};

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts
};
