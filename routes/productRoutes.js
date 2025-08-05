const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts
} = require('../controllers/productController');

// GET /api/products/search - Search products by name and category
router.get('/search', searchProducts);

// GET /api/products - Get all products with filtering and pagination
router.get('/', getProducts);

// POST /api/products - Create a new product
router.post('/', createProduct);

// GET /api/products/:id - Get single product by ID
router.get('/:id', getProductById);

// PUT /api/products/:id - Update product by ID
router.put('/:id', updateProduct);

// DELETE /api/products/:id - Delete product by ID
router.delete('/:id', deleteProduct);

module.exports = router;
