const sequelize = require('../config/db');
require('../models/associations');
const User = require('../models/user');
const VendorProfile = require('../models/vendorProfile');

const debugLogin = async () => {
  try {
    console.log('🔍 Debug Login Issue...\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // Check if any users exist
    console.log('1️⃣ Checking existing users...');
    const allUsers = await User.findAll({
      attributes: ['id', 'email', 'role']
    });
    
    console.log(`Found ${allUsers.length} users:`);
    allUsers.forEach(user => {
      console.log(`   - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    if (allUsers.length === 0) {
      console.log('\n⚠️  No users found in database!');
      console.log('Creating test users...\n');
      
      // Create test users
      const testUser = await User.create({
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
      console.log(`✅ Created test user: ${testUser.email}`);
      
      const testAdmin = await User.create({
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log(`✅ Created test admin: ${testAdmin.email}`);
      
      const testVendor = await User.create({
        email: 'vendor@example.com',
        password: 'vendor123',
        role: 'vendor'
      });
      console.log(`✅ Created test vendor: ${testVendor.email}`);
      
      // Create vendor profile for test vendor
      await VendorProfile.create({
        user_id: testVendor.id,
        business_name: 'Test Vendor Business',
        contact_name: 'Test Vendor',
        mobile_number: '1234567890'
      });
      console.log(`✅ Created vendor profile for: ${testVendor.email}`);
    }
    
    console.log('\n2️⃣ Testing password comparison...');
    
    // Test password comparison for each user
    const users = await User.findAll();
    for (const user of users) {
      console.log(`\nTesting user: ${user.email}`);
      
      // Test with correct password (assuming common test passwords)
      const testPasswords = ['password123', 'admin123', 'vendor123', 'test123'];
      
      for (const testPassword of testPasswords) {
        try {
          const isValid = user.comparePassword(testPassword);
          if (isValid) {
            console.log(`   ✅ Password '${testPassword}' works for ${user.email}`);
            break;
          }
        } catch (error) {
          console.log(`   ❌ Error testing password '${testPassword}': ${error.message}`);
        }
      }
    }
    
    console.log('\n3️⃣ Testing login simulation...');
    
    // Simulate login for first user
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`Simulating login for: ${testUser.email}`);
      
      try {
        const foundUser = await User.findByEmail(testUser.email);
        if (foundUser) {
          console.log(`   ✅ User found by email`);
          
          // Test password comparison
          const isPasswordValid = foundUser.comparePassword('password123');
          console.log(`   Password valid: ${isPasswordValid}`);
          
          if (isPasswordValid) {
            console.log(`   ✅ Login would succeed for ${testUser.email}`);
          } else {
            console.log(`   ❌ Password comparison failed`);
            console.log(`   Try these credentials:`);
            console.log(`   Email: ${testUser.email}`);
            console.log(`   Password: password123 (or admin123, vendor123)`);
          }
        } else {
          console.log(`   ❌ User not found by email`);
        }
      } catch (error) {
        console.log(`   ❌ Login simulation error: ${error.message}`);
      }
    }
    
    console.log('\n4️⃣ Recommended test credentials:');
    console.log('   Regular User:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('');
    console.log('   Admin User:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('   Vendor User:');
    console.log('   Email: vendor@example.com');
    console.log('   Password: vendor123');
    
    console.log('\n🎯 Next steps:');
    console.log('1. Start your server: npm start');
    console.log('2. Try logging in with the credentials above');
    console.log('3. Check browser network tab for detailed error messages');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

debugLogin();
