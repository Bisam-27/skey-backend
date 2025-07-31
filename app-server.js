const express = require('express');
const cors = require('cors');
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
const vendorRoutes = require('./routes/vendorRoutes');
const vendorProductRoutes = require('./routes/vendorProductRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/admin/homepage', adminHomepageRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/vendor/products', vendorProductRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false }).then(() => {
  console.log('Database synced successfully');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Vendor API endpoints available at:');
    console.log('  POST /api/vendor/register - Register vendor');
    console.log('  POST /api/vendor/login - Vendor login');
    console.log('  GET /api/vendor/profile - Get vendor profile');
    console.log('  GET /api/vendor/stats - Get vendor statistics');
    console.log('  GET /api/vendor/products - Get vendor products');
    console.log('  POST /api/vendor/products - Create product');
    console.log('  PUT /api/vendor/products/:id - Update product');
    console.log('  DELETE /api/vendor/products/:id - Delete product');
  });
}).catch((err) => {
  console.error('DB connection error:', err);
});
