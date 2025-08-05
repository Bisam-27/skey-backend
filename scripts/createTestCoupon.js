const { Coupon, User, Category } = require('../models/associations');
const sequelize = require('../config/db');

async function createTestCoupon() {
  try {
    console.log('🎫 Creating test coupon...');

    // Find or create a test vendor
    let vendor = await User.findOne({ where: { role: 'vendor' } });
    if (!vendor) {
      vendor = await User.create({
        email: 'test-vendor@example.com',
        password: 'testpass123',
        role: 'vendor'
      });
      console.log('✅ Created test vendor');
    } else {
      console.log('ℹ️ Using existing vendor');
    }

    // Find or create a test category
    let category = await Category.findOne();
    if (!category) {
      category = await Category.create({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category for coupon testing',
        is_active: true,
        sort_order: 1
      });
      console.log('✅ Created test category');
    } else {
      console.log('ℹ️ Using existing category');
    }

    // Create test coupons
    const coupons = [
      {
        code: 'SAVE20',
        product_type: 'collection',
        collection_id: category.id,
        coupon_type: 'discount',
        discount_value: 20,
        expiration_date: '2025-12-31',
        usage_limit: 100,
        minimum_order_amount: 500,
        vendor_id: vendor.id,
        is_active: true
      },
      {
        code: 'FLAT100',
        product_type: 'collection',
        collection_id: category.id,
        coupon_type: 'flat_off',
        discount_value: 100,
        expiration_date: '2025-12-31',
        usage_limit: 50,
        minimum_order_amount: 200,
        vendor_id: vendor.id,
        is_active: true
      }
    ];

    for (const couponData of coupons) {
      try {
        const existingCoupon = await Coupon.findOne({ where: { code: couponData.code } });
        if (existingCoupon) {
          console.log(`ℹ️ Coupon ${couponData.code} already exists`);
        } else {
          const coupon = await Coupon.create(couponData);
          console.log(`✅ Created coupon: ${coupon.code} (${coupon.coupon_type} - ${coupon.discount_value}${coupon.coupon_type === 'discount' ? '%' : '₹'})`);
        }
      } catch (error) {
        console.error(`❌ Failed to create coupon ${couponData.code}:`, error.message);
      }
    }

    console.log('🎉 Test coupon creation completed!');
    console.log('\n📋 Available test coupons:');
    console.log('• SAVE20 - 20% discount (min order ₹500)');
    console.log('• FLAT100 - ₹100 flat discount (min order ₹200)');

  } catch (error) {
    console.error('❌ Failed to create test coupons:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createTestCoupon()
    .then(() => {
      console.log('Test coupon creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test coupon creation failed:', error);
      process.exit(1);
    });
}

module.exports = createTestCoupon;
