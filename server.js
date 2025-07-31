const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
// Import models and associations
require('./models/associations');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);

sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(5000, () => console.log('Server running on port 5000'));
}).catch((err) => {
  console.error('DB connection error:', err);
});
