const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllVendors,
  getAllBrands,
  createBrand
} = require('../controllers/adminProductController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadProductImages, addFilePathInfo } = require('../middleware/upload');

// All admin product routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/products/vendors - Get all vendors (must be before /:id)
router.get('/vendors', getAllVendors);

// GET /api/admin/products/brands - Get all brands (must be before /:id)
router.get('/brands', getAllBrands);

// POST /api/admin/products/brands - Create new brand
router.post('/brands', createBrand);

// GET /api/admin/products - Get all products with filtering and pagination
router.get('/', getAllProducts);

// POST /api/admin/products - Create new product with image upload
router.post('/', uploadProductImages, addFilePathInfo, createProduct);

// GET /api/admin/products/:id - Get single product
router.get('/:id', getProductById);

// PUT /api/admin/products/:id - Update product with image upload
router.put('/:id', uploadProductImages, addFilePathInfo, updateProduct);

// DELETE /api/admin/products/:id - Delete product
router.delete('/:id', deleteProduct);

module.exports = router;
