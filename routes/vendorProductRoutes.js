const express = require('express');
const router = express.Router();
const {
  getVendorProducts,
  getVendorProductById,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct
} = require('../controllers/vendorProductController');
const { getAllBrands, createBrand } = require('../controllers/adminProductController');
const { authenticateToken, requireVendor } = require('../middleware/auth');
const { uploadProductImages, addFilePathInfo } = require('../middleware/upload');

// All vendor product routes require authentication and vendor role
router.use(authenticateToken);
router.use(requireVendor);

// GET /api/vendor/products/brands - Get all brands (must be before /:id)
router.get('/brands', getAllBrands);

// POST /api/vendor/products/brands - Create new brand
router.post('/brands', createBrand);

// GET /api/vendor/products - Get all products for the authenticated vendor
router.get('/', getVendorProducts);

// POST /api/vendor/products - Create a new product for the vendor with image upload
router.post('/', uploadProductImages, addFilePathInfo, createVendorProduct);

// GET /api/vendor/products/:id - Get single product by ID (only if owned by vendor)
router.get('/:id', getVendorProductById);

// PUT /api/vendor/products/:id - Update product by ID (only if owned by vendor) with image upload
router.put('/:id', uploadProductImages, addFilePathInfo, updateVendorProduct);

// DELETE /api/vendor/products/:id - Delete product by ID (only if owned by vendor)
router.delete('/:id', deleteVendorProduct);

module.exports = router;
