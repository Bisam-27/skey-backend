const Product = require('../models/product');
const { Op } = require('sequelize');

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, brand, minPrice, maxPrice } = req.query;

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

    const offset = (page - 1) * limit;

    const products = await Product.findAndCountAll({
      where: whereClause,

      // Show newest products first
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(products.count / limit),
        totalItems: products.count,
        itemsPerPage: parseInt(limit)
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

    const product = await Product.findByPk(id);

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

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
};
