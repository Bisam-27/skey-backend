const express = require('express');
const router = express.Router();
const {
  getVendorProducts,
  getVendorProductById,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct
} = require('../controllers/vendorProductController');
const { authenticateToken, requireVendor } = require('../middleware/auth');

// All vendor product routes require authentication and vendor role
router.use(authenticateToken);
router.use(requireVendor);

// GET /api/vendor/products - Get all products for the authenticated vendor
router.get('/', getVendorProducts);

// POST /api/vendor/products - Create a new product for the vendor
router.post('/', createVendorProduct);

// GET /api/vendor/products/:id - Get single product by ID (only if owned by vendor)
router.get('/:id', getVendorProductById);

// PUT /api/vendor/products/:id - Update product by ID (only if owned by vendor)
router.put('/:id', updateVendorProduct);

// DELETE /api/vendor/products/:id - Delete product by ID (only if owned by vendor)
router.delete('/:id', deleteVendorProduct);

module.exports = router;
