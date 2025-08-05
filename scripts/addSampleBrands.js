require('dotenv').config();
const sequelize = require('../config/db');
const Brand = require('../models/brand');

const sampleBrands = [
  { name: 'Apple', slug: 'apple', description: 'Premium technology products', is_active: true },
  { name: 'Samsung', slug: 'samsung', description: 'Electronics and mobile devices', is_active: true },
  { name: 'Nike', slug: 'nike', description: 'Athletic footwear and apparel', is_active: true },
  { name: 'Adidas', slug: 'adidas', description: 'Sports clothing and accessories', is_active: true },
  { name: 'Sony', slug: 'sony', description: 'Consumer electronics', is_active: true },
  { name: 'Dell', slug: 'dell', description: 'Computers and laptops', is_active: true },
  { name: 'HP', slug: 'hp', description: 'Computing solutions', is_active: true },
  { name: 'Lenovo', slug: 'lenovo', description: 'Personal computers', is_active: true },
  { name: 'Zara', slug: 'zara', description: 'Fast fashion clothing', is_active: true },
  { name: 'H&M', slug: 'hm', description: 'Fashion and quality', is_active: true }
];

const addSampleBrands = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    console.log('🔄 Syncing Brand model...');
    await Brand.sync({ alter: true });
    console.log('✅ Brand model synced.');

    console.log('🏷️ Adding sample brands...');
    
    for (const brandData of sampleBrands) {
      const [brand, created] = await Brand.findOrCreate({
        where: { slug: brandData.slug },
        defaults: brandData
      });

      if (created) {
        console.log(`✅ Created brand: ${brand.name}`);
      } else {
        console.log(`📝 Brand already exists: ${brand.name}`);
      }
    }

    console.log('🎉 Sample brands added successfully!');
    console.log('');
    console.log('📊 Available brands:');
    const allBrands = await Brand.findAll({ order: [['name', 'ASC']] });
    allBrands.forEach((brand, index) => {
      console.log(`  ${index + 1}. ${brand.name} (ID: ${brand.id})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample brands:', error);
    process.exit(1);
  }
};

addSampleBrands();
