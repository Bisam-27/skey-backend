require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Product, Subcategory } = require('../models/associations');
const sequelize = require('../config/db');

const checkProducts = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Check existing products
    const products = await Product.findAll({ limit: 5 });
    console.log(`\nExisting products: ${products.length}`);
    products.forEach(p => console.log(`- ${p.id}: ${p.name}`));

    // Check subcategories
    const subcategories = await Subcategory.findAll({ 
      limit: 10,
      attributes: ['id', 'name', 'slug']
    });
    console.log(`\nAvailable subcategories: ${subcategories.length}`);
    subcategories.forEach(s => console.log(`- ${s.id}: ${s.slug} (${s.name})`));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkProducts();
