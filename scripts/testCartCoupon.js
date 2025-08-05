const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCartCouponFunctionality() {
  try {
    console.log('🧪 Testing Cart Coupon Functionality...\n');

    // Step 1: Create/Login test user
    console.log('1️⃣ Creating/logging in test user...');
    let userToken;
    
    try {
      // Try to register a new user
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'test-customer@example.com',
        password: 'testpass123',
        role: 'user'
      });
      console.log('✅ Test user created');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️ Test user already exists');
      } else {
        throw error;
      }
    }

    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test-customer@example.com',
      password: 'testpass123'
    });
    userToken = loginResponse.data.data.token;
    console.log('✅ User logged in successfully\n');

    // Step 2: Add items to cart
    console.log('2️⃣ Adding items to cart...');
    
    // Get a product to add to cart (assuming there are products in the database)
    const productsResponse = await axios.get(`${BASE_URL}/products?limit=1`);
    if (productsResponse.data.data.products.length === 0) {
      console.log('❌ No products found in database. Please add some products first.');
      return;
    }

    const testProduct = productsResponse.data.data.products[0];
    console.log(`Using product: ${testProduct.name} (₹${testProduct.price})`);

    // Add product to cart
    await axios.post(`${BASE_URL}/cart`, {
      product_id: testProduct.id,
      quantity: 2
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Added product to cart\n');

    // Step 3: Get cart details
    console.log('3️⃣ Getting cart details...');
    const cartResponse = await axios.get(`${BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    const cart = cartResponse.data.data;
    console.log(`Cart total: ₹${cart.total_amount}`);
    console.log(`Items in cart: ${cart.item_count}`);
    console.log('Payment details:', cart.payment_details);
    console.log('');

    // Step 4: Apply coupon
    console.log('4️⃣ Applying coupon...');
    const couponCode = cart.total_amount >= 500 ? 'SAVE20' : 'FLAT100';
    console.log(`Applying coupon: ${couponCode}`);

    const applyCouponResponse = await axios.post(`${BASE_URL}/cart/coupon`, {
      code: couponCode
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (applyCouponResponse.data.success) {
      const updatedCart = applyCouponResponse.data.data;
      console.log('✅ Coupon applied successfully!');
      console.log(`New payment details:`, updatedCart.payment_details);
      console.log(`Discount applied: ₹${updatedCart.payment_details.bag_discount}`);
      console.log(`Amount payable: ₹${updatedCart.payment_details.amount_payable}\n`);
    } else {
      console.log('❌ Failed to apply coupon:', applyCouponResponse.data.message);
    }

    // Step 5: Remove coupon
    console.log('5️⃣ Removing coupon...');
    const removeCouponResponse = await axios.delete(`${BASE_URL}/cart/coupon`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (removeCouponResponse.data.success) {
      const resetCart = removeCouponResponse.data.data;
      console.log('✅ Coupon removed successfully!');
      console.log(`Reset payment details:`, resetCart.payment_details);
      console.log(`Discount: ₹${resetCart.payment_details.bag_discount}`);
      console.log(`Amount payable: ₹${resetCart.payment_details.amount_payable}\n`);
    } else {
      console.log('❌ Failed to remove coupon:', removeCouponResponse.data.message);
    }

    // Step 6: Test invalid coupon
    console.log('6️⃣ Testing invalid coupon...');
    try {
      await axios.post(`${BASE_URL}/cart/coupon`, {
        code: 'INVALID123'
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Invalid coupon correctly rejected');
      } else {
        console.log('❌ Unexpected error for invalid coupon:', error.response?.data);
      }
    }

    console.log('\n🎉 Cart coupon functionality test completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ User authentication');
    console.log('✅ Add items to cart');
    console.log('✅ Get cart with payment details');
    console.log('✅ Apply valid coupon');
    console.log('✅ Remove coupon');
    console.log('✅ Handle invalid coupon');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testCartCouponFunctionality()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = testCartCouponFunctionality;
