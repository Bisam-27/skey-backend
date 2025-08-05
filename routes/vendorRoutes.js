const express = require('express');
const router = express.Router();
const {
  registerVendor,
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorStats,
  uploadVendorDocument
} = require('../controllers/vendorController');
const { authenticateToken, requireVendor } = require('../middleware/auth');
const { uploadSingleDocument } = require('../middleware/vendorDocumentUpload');

// Public vendor routes (no authentication required)
router.post('/register', registerVendor);
router.post('/login', loginVendor);

// Protected vendor routes (require authentication and vendor role)
router.use(authenticateToken);
router.use(requireVendor);

// GET /api/vendor/profile - Get vendor profile
router.get('/profile', getVendorProfile);

// PUT /api/vendor/profile - Update vendor profile
router.put('/profile', updateVendorProfile);

// POST /api/vendor/documents/:documentType - Upload vendor document
router.post('/documents/:documentType', (req, res, next) => {
  uploadSingleDocument(req.params.documentType)(req, res, next);
}, uploadVendorDocument);

// GET /api/vendor/stats - Get vendor statistics
router.get('/stats', getVendorStats);

module.exports = router;
