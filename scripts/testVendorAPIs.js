const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
let vendorToken = '';
let testProductId = '';

// Test data
const testVendor = {
  email: 'testvendor@example.com',
  password: 'testvendor123',
  confirmPassword: 'testvendor123'
};

const testProduct = {
  name: 'Test Vendor Product',
  description: 'This is a test product created by vendor',
  price: 2999,
  stock: 50,
  discount: 10,
  subcategory_id: null, // Set to null to avoid foreign key constraint
  color: 'Blue',
  size: 'M'
};

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// Test functions
const testVendorRegistration = async () => {
  console.log('🧪 Testing vendor registration...');
  
  const result = await apiCall('POST', '/vendor/register', testVendor);
  
  if (result.success && result.data.success) {
    vendorToken = result.data.data.token;
    console.log('✅ Vendor registration successful');
    console.log(`   Token: ${vendorToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('❌ Vendor registration failed:', result.error?.message || result.error);
    return false;
  }
};

const testVendorLogin = async () => {
  console.log('\n🧪 Testing vendor login...');
  
  const loginData = {
    email: testVendor.email,
    password: testVendor.password
  };
  
  const result = await apiCall('POST', '/vendor/login', loginData);
  
  if (result.success && result.data.success) {
    vendorToken = result.data.data.token;
    console.log('✅ Vendor login successful');
    return true;
  } else {
    console.log('❌ Vendor login failed:', result.error?.message || result.error);
    return false;
  }
};

const testVendorProfile = async () => {
  console.log('\n🧪 Testing vendor profile retrieval...');
  
  const result = await apiCall('GET', '/vendor/profile', null, vendorToken);
  
  if (result.success && result.data.success) {
    console.log('✅ Vendor profile retrieved successfully');
    console.log(`   Email: ${result.data.data.vendor.email}`);
    console.log(`   Role: ${result.data.data.vendor.role}`);
    return true;
  } else {
    console.log('❌ Vendor profile retrieval failed:', result.error?.message || result.error);
    return false;
  }
};

const testVendorStats = async () => {
  console.log('\n🧪 Testing vendor statistics...');
  
  const result = await apiCall('GET', '/vendor/stats', null, vendorToken);
  
  if (result.success && result.data.success) {
    console.log('✅ Vendor statistics retrieved successfully');
    console.log(`   Total Products: ${result.data.data.stats.totalProducts}`);
    console.log(`   Total Stock: ${result.data.data.stats.totalStock}`);
    return true;
  } else {
    console.log('❌ Vendor statistics retrieval failed:', result.error?.message || result.error);
    return false;
  }
};

const testCreateProduct = async () => {
  console.log('\n🧪 Testing product creation...');
  
  const result = await apiCall('POST', '/vendor/products', testProduct, vendorToken);
  
  if (result.success && result.data.success) {
    testProductId = result.data.data.product.id;
    console.log('✅ Product creation successful');
    console.log(`   Product ID: ${testProductId}`);
    console.log(`   Product Name: ${result.data.data.product.name}`);
    return true;
  } else {
    console.log('❌ Product creation failed:', result.error?.message || result.error);
    return false;
  }
};

const testGetVendorProducts = async () => {
  console.log('\n🧪 Testing vendor products retrieval...');
  
  const result = await apiCall('GET', '/vendor/products', null, vendorToken);
  
  if (result.success && result.data.success) {
    console.log('✅ Vendor products retrieved successfully');
    console.log(`   Total Products: ${result.data.data.pagination.totalProducts}`);
    console.log(`   Products in response: ${result.data.data.products.length}`);
    return true;
  } else {
    console.log('❌ Vendor products retrieval failed:', result.error?.message || result.error);
    return false;
  }
};

const testGetProductById = async () => {
  console.log('\n🧪 Testing single product retrieval...');
  
  if (!testProductId) {
    console.log('⚠️  Skipping - no test product ID available');
    return false;
  }
  
  const result = await apiCall('GET', `/vendor/products/${testProductId}`, null, vendorToken);
  
  if (result.success && result.data.success) {
    console.log('✅ Single product retrieved successfully');
    console.log(`   Product Name: ${result.data.data.product.name}`);
    return true;
  } else {
    console.log('❌ Single product retrieval failed:', result.error?.message || result.error);
    return false;
  }
};

const testUpdateProduct = async () => {
  console.log('\n🧪 Testing product update...');
  
  if (!testProductId) {
    console.log('⚠️  Skipping - no test product ID available');
    return false;
  }
  
  const updateData = {
    name: 'Updated Test Vendor Product',
    price: 3499,
    stock: 75
  };
  
  const result = await apiCall('PUT', `/vendor/products/${testProductId}`, updateData, vendorToken);
  
  if (result.success && result.data.success) {
    console.log('✅ Product update successful');
    console.log(`   Updated Name: ${result.data.data.product.name}`);
    console.log(`   Updated Price: ${result.data.data.product.price}`);
    return true;
  } else {
    console.log('❌ Product update failed:', result.error?.message || result.error);
    return false;
  }
};

const testDeleteProduct = async () => {
  console.log('\n🧪 Testing product deletion...');
  
  if (!testProductId) {
    console.log('⚠️  Skipping - no test product ID available');
    return false;
  }
  
  const result = await apiCall('DELETE', `/vendor/products/${testProductId}`, null, vendorToken);
  
  if (result.success && result.data.success) {
    console.log('✅ Product deletion successful');
    console.log(`   Deleted Product ID: ${result.data.data.deletedProductId}`);
    return true;
  } else {
    console.log('❌ Product deletion failed:', result.error?.message || result.error);
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Vendor API Tests...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('=' * 50);
  
  const tests = [
    { name: 'Vendor Registration', fn: testVendorRegistration },
    { name: 'Vendor Login', fn: testVendorLogin },
    { name: 'Vendor Profile', fn: testVendorProfile },
    { name: 'Vendor Statistics', fn: testVendorStats },
    { name: 'Create Product', fn: testCreateProduct },
    { name: 'Get Vendor Products', fn: testGetVendorProducts },
    { name: 'Get Product by ID', fn: testGetProductById },
    { name: 'Update Product', fn: testUpdateProduct },
    { name: 'Delete Product', fn: testDeleteProduct }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} threw an error:`, error.message);
      failed++;
    }
  }
  
  console.log('\n' + '=' * 50);
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Vendor functionality is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server logs and fix any issues.');
  }
};

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
