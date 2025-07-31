const { Category, Subcategory, Product } = require('../models/associations');
const { Op } = require('sequelize');

// Get all categories with their subcategories
const getCategories = async (req, res) => {
  try {
    const { include_subcategories = 'true' } = req.query;

    const includeOptions = [];
    
    if (include_subcategories === 'true') {
      includeOptions.push({
        model: Subcategory,
        as: 'subcategories',
        where: { is_active: true },
        required: false,
        order: [['sort_order', 'ASC']]
      });
    }

    const categories = await Category.findAll({
      where: { is_active: true },
      include: includeOptions,
      order: [['sort_order', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: err.message
    });
  }
};

// Get single category by ID or slug
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { include_subcategories = 'true' } = req.query;

    const includeOptions = [];
    
    if (include_subcategories === 'true') {
      includeOptions.push({
        model: Subcategory,
        as: 'subcategories',
        where: { is_active: true },
        required: false,
        order: [['sort_order', 'ASC']]
      });
    }

    // Check if id is numeric (ID) or string (slug)
    const whereClause = isNaN(id) ? { slug: id } : { id: parseInt(id) };

    const category = await Category.findOne({
      where: { ...whereClause, is_active: true },
      include: includeOptions
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'Category with this ID or slug does not exist'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category
    });
  } catch (err) {
    console.error('Error fetching category:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category',
      error: err.message
    });
  }
};

// Get subcategories by category ID or slug
const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if categoryId is numeric (ID) or string (slug)
    const whereClause = isNaN(categoryId) ? { slug: categoryId } : { id: parseInt(categoryId) };

    const category = await Category.findOne({
      where: { ...whereClause, is_active: true }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'Category with this ID or slug does not exist'
      });
    }

    const subcategories = await Subcategory.findAll({
      where: { 
        category_id: category.id,
        is_active: true 
      },
      order: [['sort_order', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: 'Subcategories retrieved successfully',
      data: subcategories
    });
  } catch (err) {
    console.error('Error fetching subcategories:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subcategories',
      error: err.message
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      page = 1,
      limit = 12,
      subcategory,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      search = ''
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Check if categoryId is numeric (ID) or string (slug)
    const categoryWhereClause = isNaN(categoryId) ? { slug: categoryId } : { id: parseInt(categoryId) };

    const category = await Category.findOne({
      where: { ...categoryWhereClause, is_active: true }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'Category with this ID or slug does not exist'
      });
    }

    // Get all subcategories for this category
    const subcategories = await Subcategory.findAll({
      where: {
        category_id: category.id,
        is_active: true
      },
      attributes: ['id']
    });

    const subcategoryIds = subcategories.map(sub => sub.id);

    // Build where clause for products
    const productWhereClause = {
      subcategory_id: {
        [Op.in]: subcategoryIds
      }
    };

    // Filter by specific subcategory if provided
    if (subcategory) {
      const subcategoryWhereClause = isNaN(subcategory) ? { slug: subcategory } : { id: parseInt(subcategory) };
      const targetSubcategory = await Subcategory.findOne({
        where: {
          ...subcategoryWhereClause,
          category_id: category.id,
          is_active: true
        }
      });

      if (targetSubcategory) {
        productWhereClause.subcategory_id = targetSubcategory.id;
      }
    }

    // Price filtering
    if (minPrice || maxPrice) {
      productWhereClause.price = {};
      if (minPrice) productWhereClause.price[Op.gte] = parseInt(minPrice);
      if (maxPrice) productWhereClause.price[Op.lte] = parseInt(maxPrice);
    }

    // Add search functionality
    if (search && search.trim()) {
      productWhereClause[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
        { short_name: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    // Validate sort parameters
    const validSortFields = ['id', 'name', 'price', 'created_at', 'stock', 'discount'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows: products } = await Product.findAndCountAll({
      where: productWhereClause,
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
        category,
        filters: {
          sortBy: sortField,
          sortOrder: sortDirection,
          search: search || '',
          subcategory,
          minPrice,
          maxPrice
        }
      }
    });
  } catch (err) {
    console.error('Error fetching products by category:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products',
      error: err.message
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  getSubcategoriesByCategory,
  getProductsByCategory
};
