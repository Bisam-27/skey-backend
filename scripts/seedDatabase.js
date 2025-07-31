require('dotenv').config();
const sequelize = require('../config/db');
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const { seedCategories } = require('../seeders/categorySeeder');

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Syncing category models...');
    // Only sync categories and subcategories
    await Category.sync({ alter: true });
    await Subcategory.sync({ alter: true });
    console.log('Category models synced.');

    console.log('Seeding categories...');
    await seedCategories();

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
