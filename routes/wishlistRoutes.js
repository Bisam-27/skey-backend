const express = require('express');
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  getWishlistCount,
  clearWishlist,
  toggleWishlist
} = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(authenticateToken);

// POST /api/wishlist - Add item to wishlist
router.post('/', addToWishlist);

// GET /api/wishlist - Get user's wishlist
router.get('/', getWishlist);

// GET /api/wishlist/count - Get wishlist item count
router.get('/count', getWishlistCount);

// GET /api/wishlist/check/:product_id - Check if product is in wishlist
router.get('/check/:product_id', checkWishlistStatus);

// POST /api/wishlist/toggle - Toggle wishlist (add/remove)
router.post('/toggle', toggleWishlist);

// DELETE /api/wishlist/:product_id - Remove item from wishlist
router.delete('/:product_id', removeFromWishlist);

// DELETE /api/wishlist - Clear entire wishlist
router.delete('/', clearWishlist);

module.exports = router;
