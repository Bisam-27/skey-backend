const sequelize = require('../config/db');
require('../models/associations');
const User = require('../models/user');

const createTestUser = async () => {
  try {
    console.log('👤 Creating Test User...\n');
    
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    const testEmail = 'user@example.com';
    const testPassword = 'user123';
    
    // Check if user already exists
    const existingUser = await User.findByEmail(testEmail);
    if (existingUser) {
      console.log('⚠️  User already exists, deleting old one...');
      await User.destroy({ where: { id: existingUser.id } });
      console.log('✅ Old user deleted');
    }
    
    // Create new regular user
    console.log('Creating new regular user...');
    const user = await User.create({
      email: testEmail,
      password: testPassword,
      role: 'user'
    });
    
    console.log(`✅ Regular user created: ${user.email}`);
    
    // Test login
    console.log('\nTesting user login...');
    const testUser = await User.findByEmail(testEmail);
    const isPasswordValid = testUser.comparePassword(testPassword);
    
    if (isPasswordValid) {
      console.log('✅ User login test successful!');
    } else {
      console.log('❌ User login test failed');
    }
    
    console.log('\n🎉 Test User Created Successfully!');
    console.log('\n📋 User Login Credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Role: user`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Failed to create test user:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

createTestUser();
