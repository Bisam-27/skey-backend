const User = require('../models/user');
const sequelize = require('../config/db');

async function checkVendorPassword() {
  try {
    console.log('🔍 Checking vendor password...');
    
    // Find the vendor user
    const vendor = await User.findOne({
      where: { email: 'vendor@example.com' }
    });
    
    if (!vendor) {
      console.log('❌ Vendor not found');
      return;
    }
    
    console.log(`✅ Found vendor: ${vendor.email} (ID: ${vendor.id})`);
    console.log(`🔐 Hashed password: ${vendor.password}`);
    
    // Test common passwords
    const testPasswords = ['password123', 'vendor123', 'admin123', 'test123', '123456', 'password'];
    
    console.log('\n🧪 Testing common passwords...');
    for (const testPassword of testPasswords) {
      try {
        const isValid = vendor.comparePassword(testPassword);
        if (isValid) {
          console.log(`✅ Password '${testPassword}' works!`);
          break;
        } else {
          console.log(`❌ Password '${testPassword}' doesn't work`);
        }
      } catch (error) {
        console.log(`❌ Error testing password '${testPassword}': ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkVendorPassword();
