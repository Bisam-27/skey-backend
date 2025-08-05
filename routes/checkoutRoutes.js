const express = require('express');
const router = express.Router();
const {
  getCheckoutData,
  saveAddress,
  deleteAddress,
  setDefaultAddress,
  completeOrder
} = require('../controllers/checkoutController');
const { authenticateToken } = require('../middleware/auth');

// All checkout routes require authentication
router.use(authenticateToken);

// GET /api/checkout - Get checkout data (cart items, addresses, payment details)
router.get('/', getCheckoutData);

// POST /api/checkout/address - Create or update address
router.post('/address', saveAddress);

// DELETE /api/checkout/address/:id - Delete address
router.delete('/address/:id', deleteAddress);

// PUT /api/checkout/address/:id/default - Set default address
router.put('/address/:id/default', setDefaultAddress);

// POST /api/checkout/complete - Complete order and reduce stock
router.post('/complete', completeOrder);

module.exports = router;
