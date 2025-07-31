// Quick fix script to resolve all issues
console.log('🔧 Running quick fix for homepage APIs...\n');

const runFixes = async () => {
  try {
    // 1. Test route loading
    console.log('1️⃣ Testing route loading...');
    const adminRoutes = require('../routes/adminHomepageRoutes');
    const adminController = require('../controllers/adminHomepageController');
    console.log('✅ Routes and controllers load correctly\n');

    // 2. Test database connection
    console.log('2️⃣ Testing database connection...');
    const sequelize = require('../config/db');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // 3. Sync models
    console.log('3️⃣ Syncing models...');
    const Banner = require('../models/banner');
    const Testimonial = require('../models/testimonial');
    const Feature = require('../models/feature');
    
    await Banner.sync({ alter: true });
    await Testimonial.sync({ alter: true });
    await Feature.sync({ alter: true });
    console.log('✅ Models synced successfully\n');

    // 4. Test creating a simple banner
    console.log('4️⃣ Testing banner creation...');
    const testBanner = await Banner.findOrCreate({
      where: { title: 'Test Banner', type: 'hero' },
      defaults: {
        title: 'Test Banner',
        image_url: 'img/test.jpg',
        type: 'hero',
        position: 999
      }
    });
    console.log('✅ Banner creation works\n');

    // 5. Test creating an announcement (without image_url)
    console.log('5️⃣ Testing announcement creation...');
    const testAnnouncement = await Banner.findOrCreate({
      where: { title: 'Test Announcement', type: 'announcement' },
      defaults: {
        title: 'Test Announcement',
        type: 'announcement',
        position: 999
      }
    });
    console.log('✅ Announcement creation works (no image_url required)\n');

    // Clean up test data
    console.log('6️⃣ Cleaning up test data...');
    await Banner.destroy({ where: { title: 'Test Banner' } });
    await Banner.destroy({ where: { title: 'Test Announcement' } });
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All fixes applied successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Restart your server: node backend/server.js');
    console.log('   2. Run seeder: node backend/scripts/seedHomepage.js');
    console.log('   3. Test admin APIs: node backend/test/adminHomepageApiTest.js');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('\nError details:', error);
    
    if (error.name === 'SequelizeValidationError') {
      console.log('\n💡 Validation error - check model constraints');
    } else if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\n💡 Module not found - check file paths');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Database connection failed - check MySQL server');
    }
  }
};

runFixes();
