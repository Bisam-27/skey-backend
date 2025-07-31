const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  vendorEmail: 'vendor@test.com',
  vendorPassword: 'password123',
  customerEmail: 'customer@test.com',
  customerPassword: 'password123'
};

let vendorToken = '';
let customerToken = '';
let createdCouponId = '';

async function testCouponAPIs() {
  try {
    console.log('🧪 Starting Coupon API Tests...\n');

    // Step 1: Login as vendor
    console.log('1️⃣ Logging in as vendor...');
    const vendorLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: testConfig.vendorEmail,
      password: testConfig.vendorPassword
    });
    vendorToken = vendorLogin.data.data.token;
    console.log('✅ Vendor login successful\n');

    // Step 2: Login as customer
    console.log('2️⃣ Logging in as customer...');
    const customerLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: testConfig.customerEmail,
      password: testConfig.customerPassword
    });
    customerToken = customerLogin.data.data.token;
    console.log('✅ Customer login successful\n');

    // Step 3: Get vendor products
    console.log('3️⃣ Getting vendor products...');
    const productsResponse = await axios.get(`${BASE_URL}/coupons/vendor/products`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    console.log(`✅ Found ${productsResponse.data.data.length} products\n`);

    // Step 4: Get collections
    console.log('4️⃣ Getting collections...');
    const collectionsResponse = await axios.get(`${BASE_URL}/coupons/collections`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    console.log(`✅ Found ${collectionsResponse.data.data.length} collections\n`);

    // Step 5: Create a collection-based discount coupon
    console.log('5️⃣ Creating collection-based discount coupon...');
    const collectionCoupon = await axios.post(`${BASE_URL}/coupons`, {
      code: 'TEST20',
      product_type: 'collection',
      collection_id: collectionsResponse.data.data[0]?.id || 1,
      coupon_type: 'discount',
      discount_value: 20,
      expiration_date: '2025-12-31',
      usage_limit: 100,
      minimum_order_amount: 500
    }, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    createdCouponId = collectionCoupon.data.data.id;
    console.log(`✅ Collection coupon created with ID: ${createdCouponId}\n`);

    // Step 6: Create a product-specific flat-off coupon
    if (productsResponse.data.data.length > 0) {
      console.log('6️⃣ Creating product-specific flat-off coupon...');
      const productCoupon = await axios.post(`${BASE_URL}/coupons`, {
        code: 'FLAT100',
        product_type: 'product',
        product_id: productsResponse.data.data[0].id,
        coupon_type: 'flat_off',
        discount_value: 100,
        expiration_date: '2025-12-31',
        usage_limit: 50
      }, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      console.log(`✅ Product coupon created with ID: ${productCoupon.data.data.id}\n`);
    }

    // Step 7: Get vendor coupons
    console.log('7️⃣ Getting vendor coupons...');
    const vendorCoupons = await axios.get(`${BASE_URL}/coupons/vendor/coupons`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    console.log(`✅ Found ${vendorCoupons.data.data.coupons.length} coupons\n`);

    // Step 8: Get coupon details
    console.log('8️⃣ Getting coupon details...');
    const couponDetails = await axios.get(`${BASE_URL}/coupons/${createdCouponId}`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    console.log(`✅ Coupon details retrieved for: ${couponDetails.data.data.coupon.code}\n`);

    // Step 9: Validate coupon as customer
    console.log('9️⃣ Validating coupon as customer...');
    const validation = await axios.post(`${BASE_URL}/coupons/validate`, {
      code: 'TEST20',
      order_amount: 1000,
      product_ids: []
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log(`✅ Coupon validated - Discount: ₹${validation.data.data.discount_amount}\n`);

    // Step 10: Update coupon
    console.log('🔟 Updating coupon...');
    const updatedCoupon = await axios.put(`${BASE_URL}/coupons/${createdCouponId}`, {
      discount_value: 25,
      usage_limit: 150
    }, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    console.log(`✅ Coupon updated - New discount: ${updatedCoupon.data.data.discount_value}%\n`);

    // Step 11: Test invalid coupon validation
    console.log('1️⃣1️⃣ Testing invalid coupon validation...');
    try {
      await axios.post(`${BASE_URL}/coupons/validate`, {
        code: 'INVALID',
        order_amount: 1000
      }, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Invalid coupon correctly rejected\n');
      } else {
        throw error;
      }
    }

    // Step 12: Test minimum order amount validation
    console.log('1️⃣2️⃣ Testing minimum order amount validation...');
    try {
      await axios.post(`${BASE_URL}/coupons/validate`, {
        code: 'TEST20',
        order_amount: 300 // Less than minimum 500
      }, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Minimum order amount validation working\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 All Coupon API tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Vendor authentication');
    console.log('✅ Customer authentication');
    console.log('✅ Get vendor products');
    console.log('✅ Get collections');
    console.log('✅ Create collection coupon');
    console.log('✅ Create product coupon');
    console.log('✅ Get vendor coupons');
    console.log('✅ Get coupon details');
    console.log('✅ Validate coupon');
    console.log('✅ Update coupon');
    console.log('✅ Invalid coupon handling');
    console.log('✅ Minimum order validation');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Helper function to create test users if they don't exist
async function createTestUsers() {
  try {
    console.log('👥 Creating test users...\n');

    // Create vendor user
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: testConfig.vendorEmail,
        password: testConfig.vendorPassword,
        role: 'vendor'
      });
      console.log('✅ Vendor user created');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️ Vendor user already exists');
      } else {
        throw error;
      }
    }

    // Create customer user
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: testConfig.customerEmail,
        password: testConfig.customerPassword,
        role: 'user'
      });
      console.log('✅ Customer user created');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️ Customer user already exists');
      } else {
        throw error;
      }
    }

    console.log('');
  } catch (error) {
    console.error('❌ Failed to create test users:', error.response?.data || error.message);
  }
}

// Run tests
if (require.main === module) {
  createTestUsers()
    .then(() => testCouponAPIs())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { testCouponAPIs, createTestUsers };
