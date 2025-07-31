const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  getSubcategoriesByCategory,
  getProductsByCategory
} = require('../controllers/categoryController');

// GET /api/categories - Get all categories with optional subcategories
router.get('/', getCategories);

// GET /api/categories/:id - Get single category by ID or slug
router.get('/:id', getCategoryById);

// GET /api/categories/:categoryId/subcategories - Get subcategories by category
router.get('/:categoryId/subcategories', getSubcategoriesByCategory);

// GET /api/categories/:categoryId/products - Get products by category
router.get('/:categoryId/products', getProductsByCategory);

module.exports = router;
