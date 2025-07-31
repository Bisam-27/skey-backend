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

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/admin/homepage', adminHomepageRoutes);

sequelize.sync({ force: false }).then(() => {
  console.log('Database synced successfully');
  app.listen(5000, () => {
    console.log('Server running on port 5000');
    console.log('Cart API endpoints available at:');
    console.log('  POST /api/cart - Add item to cart');
    console.log('  GET /api/cart - Get user cart');
    console.log('  PUT /api/cart/:product_id - Update cart item');
    console.log('  DELETE /api/cart/:product_id - Remove cart item');
  });
}).catch((err) => {
  console.error('DB connection error:', err);
});
