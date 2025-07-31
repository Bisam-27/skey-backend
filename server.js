const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/db');
// Import models and associations
require('./models/associations');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const userRoutes = require('./routes/userRoutes');
const homepageRoutes = require('./routes/homepageRoutes');
const adminHomepageRoutes = require('./routes/adminHomepageRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const vendorProductRoutes = require('./routes/vendorProductRoutes');
const couponRoutes = require('./routes/couponRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/admin/homepage', adminHomepageRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/vendor/products', vendorProductRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/checkout', checkoutRoutes);

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

sequelize.sync({ force: false }).then(() => {
  console.log('Database synced successfully');
  app.listen(5000, () => {
    console.log('🚀 Server running on port 5000');
    console.log('📱 Frontend available at: http://localhost:5000');
    console.log('🛒 Cart page: http://localhost:5000/cart.html');
    console.log('💳 Checkout page: http://localhost:5000/checkout.html');
    console.log('👤 Login page: http://localhost:5000/login.html');
    console.log('');
    console.log('📡 API endpoints available:');
    console.log('  POST /api/cart - Add item to cart');
    console.log('  GET /api/cart - Get user cart');
    console.log('  PUT /api/cart/:product_id - Update cart item');
    console.log('  DELETE /api/cart/:product_id - Remove cart item');
    console.log('  GET /api/checkout - Get checkout data');
    console.log('  POST /api/checkout/address - Save address');
  });
}).catch((err) => {
  console.error('DB connection error:', err);
});
