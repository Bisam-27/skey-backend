const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  testProductData
} = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

// All cart routes require authentication
router.use(authenticateToken);

// POST /api/cart - Add item to cart
router.post('/', addToCart);

// GET /api/cart - Get user's cart
router.get('/', getCart);

// GET /api/cart/count - Get cart item count
router.get('/count', getCartCount);

// PUT /api/cart/:product_id - Update item quantity in cart
router.put('/:product_id', updateCartItem);

// DELETE /api/cart/:product_id - Remove item from cart
router.delete('/:product_id', removeFromCart);

// DELETE /api/cart - Clear entire cart
router.delete('/', clearCart);

// GET /api/cart/test/:product_id - Test product data (for debugging)
router.get('/test/:product_id', testProductData);

module.exports = router;
