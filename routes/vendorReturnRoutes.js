const express = require('express');
const router = express.Router();
const {
  getVendorReturns,
  getVendorFulfilledReturns,
  getVendorUnfulfilledReturns,
  getVendorReturnStats,
  updateVendorReturnStatus
} = require('../controllers/vendorReturnController');
const { authenticateToken, requireVendor } = require('../middleware/auth');

// All vendor return routes require authentication and vendor role
router.use(authenticateToken);
router.use(requireVendor);

// GET /api/vendor/returns - Get all returns for the authenticated vendor
router.get('/', getVendorReturns);

// GET /api/vendor/returns/stats - Get return statistics for the authenticated vendor
router.get('/stats', getVendorReturnStats);

// GET /api/vendor/returns/fulfilled - Get fulfilled returns for the authenticated vendor
router.get('/fulfilled', getVendorFulfilledReturns);

// GET /api/vendor/returns/unfulfilled - Get unfulfilled returns for the authenticated vendor
router.get('/unfulfilled', getVendorUnfulfilledReturns);

// PUT /api/vendor/returns/:returnId/status - Update return fulfillment status
router.put('/:returnId/status', updateVendorReturnStatus);

module.exports = router;
