// Load environment variables from backend directory
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const sequelize = require('../config/db');
const Banner = require('../models/banner');
const Testimonial = require('../models/testimonial');
const Feature = require('../models/feature');
const { seedHomepageContent } = require('../seeders/homepageSeeder');

const seedHomepage = async () => {
  try {
    console.log('🚀 Starting homepage content seeding...\n');
    
    // Test database connection
    console.log('1️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Sync models
    console.log('2️⃣ Syncing homepage models...');
    await Banner.sync({ alter: true });
    await Testimonial.sync({ alter: true });
    await Feature.sync({ alter: true });
    console.log('✅ Models synced successfully\n');

    // Seed homepage content
    console.log('3️⃣ Seeding homepage content...');
    await seedHomepageContent();
    console.log('✅ Homepage content seeded successfully\n');

    // Display statistics
    console.log('📊 SEEDING SUMMARY:');
    const bannerCount = await Banner.count();
    const testimonialCount = await Testimonial.count();
    const featureCount = await Feature.count();
    
    console.log(`   Total Banners: ${bannerCount}`);
    console.log(`   Total Testimonials: ${testimonialCount}`);
    console.log(`   Total Features: ${featureCount}`);
    
    console.log('\n🎉 Homepage seeding completed successfully!');
    console.log('🔗 You can now test the homepage APIs:');
    console.log('   GET /api/homepage - All homepage content');
    console.log('   GET /api/homepage/banners/hero - Hero banners');
    console.log('   GET /api/homepage/banners/promotional - Promotional banners');
    console.log('   GET /api/homepage/announcements - Announcements');
    console.log('   GET /api/homepage/testimonials - Testimonials');
    console.log('   GET /api/homepage/features - Why choose us features');

    process.exit(0);
  } catch (error) {
    console.error('❌ Homepage seeding failed:', error);
    
    if (error.message.includes('Access denied')) {
      console.log('\n💡 Database connection issue. Please check:');
      console.log('   - MySQL server is running');
      console.log('   - Database credentials in .env file');
      console.log('   - Database exists');
    }
    
    process.exit(1);
  }
};

seedHomepage();
