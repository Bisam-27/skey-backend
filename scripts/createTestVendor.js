const sequelize = require('../config/db');
require('../models/associations');
const User = require('../models/user');
const VendorProfile = require('../models/vendorProfile');

const createTestVendor = async () => {
  try {
    console.log('🏪 Creating Test Vendor...\n');
    
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    const testEmail = 'vendor@example.com';
    const testPassword = 'vendor123';
    
    // Check if vendor already exists
    const existingVendor = await User.findByEmail(testEmail);
    if (existingVendor) {
      console.log('⚠️  Vendor already exists, deleting old one...');
      
      // Delete vendor profile first
      await VendorProfile.destroy({ where: { user_id: existingVendor.id } });
      
      // Delete user
      await User.destroy({ where: { id: existingVendor.id } });
      
      console.log('✅ Old vendor deleted');
    }
    
    // Create new vendor user
    console.log('Creating new vendor user...');
    const vendor = await User.create({
      email: testEmail,
      password: testPassword,
      role: 'vendor'
    });
    
    console.log(`✅ Vendor user created: ${vendor.email}`);
    
    // Create vendor profile
    console.log('Creating vendor profile...');
    const vendorProfile = await VendorProfile.create({
      user_id: vendor.id,
      business_name: 'Test Vendor Business Ltd',
      contact_name: 'John Vendor',
      mobile_number: '+1234567890',
      gst_number: 'GST123456789',
      business_address: '123 Business Street, Commerce City',
      bank_name: 'Test Bank',
      pan_number: 'ABCDE1234F',
      is_verified: false
    });
    
    console.log(`✅ Vendor profile created: ${vendorProfile.business_name}`);
    
    // Test login
    console.log('\nTesting vendor login...');
    const testUser = await User.findByEmail(testEmail);
    const isPasswordValid = testUser.comparePassword(testPassword);
    
    if (isPasswordValid) {
      console.log('✅ Vendor login test successful!');
    } else {
      console.log('❌ Vendor login test failed');
    }
    
    console.log('\n🎉 Test Vendor Created Successfully!');
    console.log('\n📋 Vendor Login Credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Role: vendor`);
    console.log(`   Business: ${vendorProfile.business_name}`);
    
    console.log('\n🧪 Test Instructions:');
    console.log('1. Start your server: npm start');
    console.log('2. Go to: http://localhost:5000/vendor pannel/login.html');
    console.log(`3. Login with: ${testEmail} / ${testPassword}`);
    console.log('4. Should redirect to vendor dashboard');
    console.log('');
    console.log('OR test unified login:');
    console.log('1. Go to: http://localhost:5000/frontend/login.html');
    console.log(`2. Login with: ${testEmail} / ${testPassword}`);
    console.log('3. Should redirect to vendor panel');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Failed to create test vendor:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

createTestVendor();
