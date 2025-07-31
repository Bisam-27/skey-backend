// Test script to check if server routes are loading correctly
const express = require('express');

console.log('🔍 Testing server route loading...\n');

try {
  // Test loading admin homepage routes
  console.log('1️⃣ Testing admin homepage routes import...');
  const adminHomepageRoutes = require('../routes/adminHomepageRoutes');
  console.log('✅ Admin homepage routes loaded successfully');
  
  // Test loading admin homepage controller
  console.log('2️⃣ Testing admin homepage controller import...');
  const adminController = require('../controllers/adminHomepageController');
  console.log('✅ Admin homepage controller loaded successfully');
  
  // Test loading auth middleware
  console.log('3️⃣ Testing auth middleware import...');
  const { authenticateToken, requireAdmin } = require('../middleware/auth');
  console.log('✅ Auth middleware loaded successfully');
  
  // Test creating express app with routes
  console.log('4️⃣ Testing express app creation...');
  const app = express();
  app.use('/api/admin/homepage', adminHomepageRoutes);
  console.log('✅ Express app with admin routes created successfully');
  
  // List available functions in controller
  console.log('\n📋 Available admin controller functions:');
  Object.keys(adminController).forEach(func => {
    console.log(`   - ${func}`);
  });
  
  console.log('\n🎉 All route components loaded successfully!');
  console.log('💡 The server should be able to register admin routes properly.');
  
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  console.error('\n🔍 Error details:', error);
  
  if (error.message.includes('Cannot find module')) {
    console.log('\n💡 Possible solutions:');
    console.log('   - Check if all required files exist');
    console.log('   - Verify file paths are correct');
    console.log('   - Make sure all dependencies are installed');
  }
}
