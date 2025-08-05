// Quick test to check if associations are working
const sequelize = require('../config/db');

async function quickTest() {
  try {
    console.log('🔍 Quick Association Test...\n');
    
    // Import models with associations
    console.log('Loading models and associations...');
    require('../models/associations');
    const User = require('../models/user');
    const VendorProfile = require('../models/vendorProfile');
    
    console.log('✅ Models loaded');
    console.log(`User associations: ${Object.keys(User.associations || {})}`);
    console.log(`VendorProfile associations: ${Object.keys(VendorProfile.associations || {})}\n`);
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // Create test data
    const testEmail = `quick-test-${Date.now()}@example.com`;
    console.log(`Creating test user: ${testEmail}`);
    
    const user = await User.create({
      email: testEmail,
      password: 'test123',
      role: 'vendor'
    });
    
    console.log(`✅ User created with ID: ${user.id}`);
    
    const profile = await VendorProfile.create({
      user_id: user.id,
      business_name: 'Quick Test Business',
      contact_name: 'Test User',
      mobile_number: '1234567890'
    });
    
    console.log(`✅ Profile created with ID: ${profile.id}\n`);
    
    // Test association
    console.log('Testing association...');
    
    try {
      const userWithProfile = await User.findByPk(user.id, {
        include: [{
          model: VendorProfile,
          as: 'vendorProfile'
        }]
      });
      
      if (userWithProfile && userWithProfile.vendorProfile) {
        console.log('🎉 SUCCESS! Association is working!');
        console.log(`User: ${userWithProfile.email}`);
        console.log(`Business: ${userWithProfile.vendorProfile.business_name}`);
      } else {
        console.log('❌ Association failed');
        console.log(`User found: ${!!userWithProfile}`);
        console.log(`Profile found: ${!!userWithProfile?.vendorProfile}`);
      }
    } catch (error) {
      console.log('❌ Association error:', error.message);
    }
    
    // Clean up
    console.log('\nCleaning up...');
    await VendorProfile.destroy({ where: { user_id: user.id } });
    await User.destroy({ where: { id: user.id } });
    console.log('✅ Cleaned up');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

quickTest();
