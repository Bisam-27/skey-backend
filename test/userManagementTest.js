// Simple test script to demonstrate user management APIs
// This is not a formal test suite, just examples of how to use the APIs

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  adminCredentials: {
    email: 'admin@example.com',
    password: 'admin123'
  },
  regularUserCredentials: {
    email: 'user@example.com',
    password: 'user123'
  }
};

let adminToken = '';
let regularUserToken = '';

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
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response ? error.response.data : error.message 
    };
  }
};

// Test functions
const testAdminLogin = async () => {
  console.log('\n=== Testing Admin Login ===');
  const result = await apiCall('POST', '/auth/login', testConfig.adminCredentials);
  
  if (result.success && result.data.success) {
    adminToken = result.data.data.token;
    console.log('✅ Admin login successful');
    console.log('Admin user:', result.data.data.user);
    return true;
  } else {
    console.log('❌ Admin login failed:', result.error);
    return false;
  }
};

const testRegularUserLogin = async () => {
  console.log('\n=== Testing Regular User Login ===');
  const result = await apiCall('POST', '/auth/login', testConfig.regularUserCredentials);
  
  if (result.success && result.data.success) {
    regularUserToken = result.data.data.token;
    console.log('✅ Regular user login successful');
    console.log('Regular user:', result.data.data.user);
    return true;
  } else {
    console.log('❌ Regular user login failed:', result.error);
    return false;
  }
};

const testGetAllUsersAsAdmin = async () => {
  console.log('\n=== Testing Get All Users (Admin) ===');
  const result = await apiCall('GET', '/users', null, adminToken);
  
  if (result.success) {
    console.log('✅ Get all users successful');
    console.log('Total users:', result.data.data.pagination.totalUsers);
    console.log('Users on this page:', result.data.data.users.length);
  } else {
    console.log('❌ Get all users failed:', result.error);
  }
};

const testGetAllUsersAsRegularUser = async () => {
  console.log('\n=== Testing Get All Users (Regular User - Should Fail) ===');
  const result = await apiCall('GET', '/users', null, regularUserToken);
  
  if (!result.success && result.error.message === 'Admin access required') {
    console.log('✅ Access correctly denied for regular user');
  } else {
    console.log('❌ Regular user should not have access to user management');
  }
};

const testGetUserStats = async () => {
  console.log('\n=== Testing Get User Statistics (Admin) ===');
  const result = await apiCall('GET', '/users/stats', null, adminToken);
  
  if (result.success) {
    console.log('✅ Get user stats successful');
    console.log('Statistics:', result.data.data);
  } else {
    console.log('❌ Get user stats failed:', result.error);
  }
};

const testGetSpecificUser = async () => {
  console.log('\n=== Testing Get Specific User (Admin) ===');
  const result = await apiCall('GET', '/users/1', null, adminToken);
  
  if (result.success) {
    console.log('✅ Get specific user successful');
    console.log('User details:', result.data.data.user);
  } else {
    console.log('❌ Get specific user failed:', result.error);
  }
};

const testWithoutAuthentication = async () => {
  console.log('\n=== Testing Without Authentication (Should Fail) ===');
  const result = await apiCall('GET', '/users');
  
  if (!result.success && result.error.message === 'Access token is required') {
    console.log('✅ Access correctly denied without authentication');
  } else {
    console.log('❌ Should require authentication');
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting User Management API Tests');
  console.log('Make sure your server is running on http://localhost:5000');
  console.log('And that you have created an admin user using the createAdminUser.js script');

  // Test authentication
  const adminLoginSuccess = await testAdminLogin();
  if (!adminLoginSuccess) {
    console.log('\n❌ Cannot proceed without admin login. Please run: node backend/scripts/createAdminUser.js');
    return;
  }

  // Try to login regular user (might not exist)
  await testRegularUserLogin();

  // Test admin endpoints
  await testGetAllUsersAsAdmin();
  await testGetUserStats();
  await testGetSpecificUser();

  // Test access control
  await testWithoutAuthentication();
  if (regularUserToken) {
    await testGetAllUsersAsRegularUser();
  }

  console.log('\n🎉 Tests completed!');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
