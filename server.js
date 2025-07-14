const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
const Product = require('./models/product');
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/products', productRoutes);

sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(5000, () => console.log('Server running on port 5000'));
}).catch((err) => {
  console.error('DB connection error:', err);
});
