const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test vendor login first
const testVendorLogin = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/vendor/login`, {
      email: 'testvendor@example.com',
      password: 'testvendor123'
    });
    
    if (response.data.success) {
      console.log('✅ Vendor login successful');
      return response.data.data.token;
    } else {
      console.log('❌ Vendor login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Vendor login error:', error.response?.data?.message || error.message);
    return null;
  }
};

// Test product creation
const testProductCreation = async (token) => {
  try {
    const productData = {
      name: 'Debug Test Product',
      description: 'This is a debug test product',
      price: 1999,
      stock: 25,
      discount: 5
    };
    
    console.log('🧪 Testing product creation with data:', productData);
    
    const response = await axios.post(`${BASE_URL}/vendor/products`, productData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ Product creation successful');
      console.log('Product ID:', response.data.data.product.id);
      console.log('Product Name:', response.data.data.product.name);
      return response.data.data.product.id;
    } else {
      console.log('❌ Product creation failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Product creation error:', error.response?.data?.message || error.message);
    console.log('Full error response:', error.response?.data);
    return null;
  }
};

// Main test function
const runTest = async () => {
  console.log('🚀 Starting Product Creation Debug Test...\n');
  
  // Step 1: Login
  const token = await testVendorLogin();
  if (!token) {
    console.log('Cannot proceed without valid token');
    return;
  }
  
  console.log(`Token received: ${token.substring(0, 20)}...\n`);
  
  // Step 2: Test product creation
  const productId = await testProductCreation(token);
  
  if (productId) {
    console.log('\n🎉 Product creation test completed successfully!');
  } else {
    console.log('\n⚠️ Product creation test failed. Check server logs for details.');
  }
};

// Run the test
runTest().catch(console.error);
