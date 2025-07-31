const { Coupon, CouponUsage, User, Product, Category } = require('../models/associations');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

async function cleanupTestData() {
  console.log('🧹 Starting cleanup of test data...\n');

  try {
    // Start transaction for safe cleanup
    const transaction = await sequelize.transaction();

    try {
      // 1. Delete test coupon usage records
      console.log('🗑️ Cleaning up coupon usage records...');
      const usageDeleted = await CouponUsage.destroy({
        where: {},
        transaction
      });
      console.log(`✅ Deleted ${usageDeleted} coupon usage records`);

      // 2. Delete test coupons
      console.log('🗑️ Cleaning up test coupons...');
      const couponsDeleted = await Coupon.destroy({
        where: {},
        transaction
      });
      console.log(`✅ Deleted ${couponsDeleted} test coupons`);

      // 3. Delete test products (those created by test vendors)
      console.log('🗑️ Cleaning up test products...');
      const testProductsDeleted = await Product.destroy({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%test%' } },
            { name: { [Op.like]: '%Test%' } },
            { name: { [Op.like]: '%DEBUG%' } },
            { name: { [Op.like]: '%Debug%' } },
            { name: { [Op.like]: '%Integration%' } },
            { description: { [Op.like]: '%test%' } },
            { description: { [Op.like]: '%Test%' } },
            { description: { [Op.like]: '%debug%' } },
            { description: { [Op.like]: '%Debug%' } }
          ]
        },
        transaction
      });
      console.log(`✅ Deleted ${testProductsDeleted} test products`);

      // 4. Delete test users
      console.log('🗑️ Cleaning up test users...');
      const testUsersDeleted = await User.destroy({
        where: {
          email: {
            [Op.or]: [
              { [Op.like]: '%test%' },
              { [Op.like]: '%Test%' },
              { [Op.like]: '%debug%' },
              { [Op.like]: '%Debug%' },
              { [Op.like]: '%integration%' },
              { [Op.like]: '%Integration%' }
            ]
          }
        },
        transaction
      });
      console.log(`✅ Deleted ${testUsersDeleted} test users`);

      // 5. Delete test categories
      console.log('🗑️ Cleaning up test categories...');
      const testCategoriesDeleted = await Category.destroy({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%test%' } },
            { name: { [Op.like]: '%Test%' } },
            { name: { [Op.like]: '%DEBUG%' } },
            { name: { [Op.like]: '%Debug%' } },
            { name: { [Op.like]: '%Integration%' } },
            { slug: { [Op.like]: '%test%' } },
            { slug: { [Op.like]: '%debug%' } },
            { slug: { [Op.like]: '%integration%' } }
          ]
        },
        transaction
      });
      console.log(`✅ Deleted ${testCategoriesDeleted} test categories`);

      // Commit transaction
      await transaction.commit();

      console.log('\n📊 Cleanup Summary:');
      console.log(`   Coupon Usage Records: ${usageDeleted}`);
      console.log(`   Test Coupons: ${couponsDeleted}`);
      console.log(`   Test Products: ${testProductsDeleted}`);
      console.log(`   Test Users: ${testUsersDeleted}`);
      console.log(`   Test Categories: ${testCategoriesDeleted}`);

      console.log('\n✅ Test data cleanup completed successfully!');

      // Show remaining data counts
      console.log('\n📈 Remaining data in database:');
      const remainingUsers = await User.count();
      const remainingProducts = await Product.count();
      const remainingCategories = await Category.count();
      const remainingCoupons = await Coupon.count();
      const remainingUsage = await CouponUsage.count();

      console.log(`   Users: ${remainingUsers}`);
      console.log(`   Products: ${remainingProducts}`);
      console.log(`   Categories: ${remainingCategories}`);
      console.log(`   Coupons: ${remainingCoupons}`);
      console.log(`   Coupon Usage: ${remainingUsage}`);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  }
}

// Advanced cleanup function for specific test patterns
async function cleanupSpecificTestData() {
  console.log('🎯 Running specific test data cleanup...\n');

  try {
    // Clean up by specific test patterns
    const testPatterns = [
      'test-vendor@example.com',
      'test-customer@example.com',
      'test-vendor-integration@example.com',
      'test-customer-integration@example.com',
      'debug-vendor@test.com',
      'vendor@test.com',
      'customer@test.com',
      'another-vendor@example.com'
    ];

    console.log('🗑️ Cleaning up specific test user accounts...');
    for (const email of testPatterns) {
      const user = await User.findOne({ where: { email } });
      if (user) {
        // Delete user's coupons first
        await Coupon.destroy({ where: { vendor_id: user.id } });
        // Delete user's products
        await Product.destroy({ where: { vendor_id: user.id } });
        // Delete user
        await User.destroy({ where: { id: user.id } });
        console.log(`✅ Cleaned up user: ${email}`);
      }
    }

    // Clean up test coupon codes
    const testCouponCodes = [
      'TEST20',
      'FLAT100',
      'TEST20COLLECTION',
      'FLAT100PRODUCT',
      'INTEGRATION20',
      'FLAT500',
      'DEBUG20',
      'DEBUG50',
      'DEBUG500',
      'CUSTOMER_COUPON',
      'UNAUTHORIZED',
      'INCOMPLETE',
      'INVALID_DISCOUNT'
    ];

    console.log('🗑️ Cleaning up specific test coupons...');
    for (const code of testCouponCodes) {
      const deleted = await Coupon.destroy({ where: { code } });
      if (deleted > 0) {
        console.log(`✅ Deleted coupon: ${code}`);
      }
    }

    // Clean up test categories by name
    const testCategoryNames = [
      'Test Electronics',
      'Integration Test Category',
      'Debug Test Category'
    ];

    console.log('🗑️ Cleaning up specific test categories...');
    for (const name of testCategoryNames) {
      const deleted = await Category.destroy({ where: { name } });
      if (deleted > 0) {
        console.log(`✅ Deleted category: ${name}`);
      }
    }

    console.log('\n✅ Specific test data cleanup completed!');

  } catch (error) {
    console.error('❌ Specific cleanup failed:', error.message);
    throw error;
  }
}

// Function to reset auto-increment counters
async function resetAutoIncrements() {
  console.log('🔄 Resetting auto-increment counters...\n');

  try {
    const tables = ['coupons', 'coupon_usage'];
    
    for (const table of tables) {
      await sequelize.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
      console.log(`✅ Reset auto-increment for ${table}`);
    }

    console.log('\n✅ Auto-increment reset completed!');

  } catch (error) {
    console.error('❌ Auto-increment reset failed:', error.message);
  }
}

// Main cleanup function
async function runCleanup() {
  console.log('🧹 Coupon System Test Data Cleanup\n');
  console.log('This will remove all test data created during coupon system testing.\n');

  try {
    // Run general cleanup
    await cleanupTestData();
    
    // Run specific cleanup
    await cleanupSpecificTestData();
    
    // Reset auto-increments
    await resetAutoIncrements();

    console.log('\n🎉 All cleanup operations completed successfully!');
    console.log('\n📋 What was cleaned up:');
    console.log('   ✅ All test coupon usage records');
    console.log('   ✅ All test coupons');
    console.log('   ✅ All test products');
    console.log('   ✅ All test user accounts');
    console.log('   ✅ All test categories');
    console.log('   ✅ Auto-increment counters reset');
    
    console.log('\n💡 Your production data remains untouched!');
    console.log('   The coupon system is ready for real use.');

  } catch (error) {
    console.error('💥 Cleanup process failed:', error.message);
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  switch (command) {
    case 'all':
      runCleanup().then(() => process.exit(0));
      break;
    case 'general':
      cleanupTestData().then(() => process.exit(0));
      break;
    case 'specific':
      cleanupSpecificTestData().then(() => process.exit(0));
      break;
    case 'reset':
      resetAutoIncrements().then(() => process.exit(0));
      break;
    default:
      console.log('Usage: node cleanupTestData.js [all|general|specific|reset]');
      console.log('  all      - Run all cleanup operations (default)');
      console.log('  general  - Clean up test data by patterns');
      console.log('  specific - Clean up specific test accounts/coupons');
      console.log('  reset    - Reset auto-increment counters');
      process.exit(0);
  }
}

module.exports = {
  cleanupTestData,
  cleanupSpecificTestData,
  resetAutoIncrements,
  runCleanup
};
