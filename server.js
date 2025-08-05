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
const userOrderRoutes = require('./routes/userOrderRoutes');
const homepageRoutes = require('./routes/homepageRoutes');
const adminHomepageRoutes = require('./routes/adminHomepageRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const adminOrderRoutes = require('./routes/adminOrderRoutes');
const adminProductRoutes = require('./routes/adminProductRoutes');
const adminCouponRoutes = require('./routes/adminCouponRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const vendorProductRoutes = require('./routes/vendorProductRoutes');
const vendorOrderRoutes = require('./routes/vendorOrderRoutes');
const vendorReturnRoutes = require('./routes/vendorReturnRoutes');
const vendorCouponRoutes = require('./routes/vendorCouponRoutes');
const couponRoutes = require('./routes/couponRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing form data

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes (must come before static file serving)
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user/orders', userOrderRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/admin/homepage', adminHomepageRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/coupons', adminCouponRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/vendor/products', vendorProductRoutes);
app.use('/api/vendor/orders', vendorOrderRoutes);
app.use('/api/vendor/returns', vendorReturnRoutes);
app.use('/api/vendor/coupons', vendorCouponRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/checkout', checkoutRoutes);

// Serve static files from frontend directory (after API routes)
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve admin panel static files
app.use('/admin', express.static(path.join(__dirname, '../admin pannel')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

sequelize.sync({ force: false }).then(() => {
  console.log('✅ Database synced successfully');
  app.listen(5000, () => {
    console.log('');
    console.log('🎉 Skeyy E-commerce Server is running successfully!');
    console.log('📱 Frontend: http://localhost:5000');
    console.log('🔧 Admin Panel: http://localhost:5000/admin');
    console.log('🩺 Health Check: http://localhost:5000/api/health');
    console.log('');
    console.log('📋 Main Pages:');
    console.log('  🏠 Homepage: http://localhost:5000');
    console.log('  🛒 Cart: http://localhost:5000/cart.html');
    console.log('  💳 Checkout: http://localhost:5000/checkout.html');
    console.log('  👤 Login: http://localhost:5000/login.html');
    console.log('  📦 Products: http://localhost:5000/products.html');
    console.log('');
    console.log('🔧 Admin Panel:');
    console.log('  📊 Dashboard: http://localhost:5000/admin');
    console.log('  📦 Add Product: http://localhost:5000/admin/add-product.html');
    console.log('  📋 Product List: http://localhost:5000/admin/select-product.html');
    console.log('  📈 Orders: http://localhost:5000/admin/orders.html');
    console.log('');
    console.log('📡 Admin API Endpoints:');
    console.log('  GET  /api/admin/products - List all products');
    console.log('  POST /api/admin/products - Create new product');
    console.log('  GET  /api/admin/products/vendors - List all vendors');
    console.log('  GET  /api/admin/products/brands - List all brands');
    console.log('  POST /api/admin/products/brands - Create new brand');
    console.log('');
    console.log('✨ Server ready for admin product management!');
  });
}).catch((err) => {
  console.error('❌ DB connection error:', err);
});
