// Load environment variables from backend directory
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const sequelize = require('../config/db');
const User = require('../models/user');

const debugUser = async () => {
  try {
    console.log('🔍 Debugging User Model and Database...\n');
    
    // Test database connection
    console.log('1. Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Check table structure
    console.log('2. Checking user table structure...');
    try {
      const [results] = await sequelize.query('DESCRIBE user');
      console.log('📋 Current user table columns:');
      results.forEach(column => {
        console.log(`   - ${column.Field}: ${column.Type} (${column.Null === 'YES' ? 'nullable' : 'not null'}) ${column.Default ? `default: ${column.Default}` : ''}`);
      });
      console.log('');
    } catch (error) {
      console.log('❌ Error checking table structure:', error.message);
      console.log('💡 The user table might not exist yet.\n');
    }

    // Check if any users exist
    console.log('3. Checking existing users...');
    try {
      const users = await User.findAll({
        attributes: ['id', 'email', 'role'],
        limit: 10
      });
      
      if (users.length === 0) {
        console.log('📭 No users found in database');
      } else {
        console.log(`👥 Found ${users.length} users:`);
        users.forEach(user => {
          console.log(`   - ID: ${user.id}, Email: ${user.email}, Role: ${user.role || 'undefined'}`);
        });
      }
      console.log('');
    } catch (error) {
      console.log('❌ Error fetching users:', error.message);
      console.log('💡 This might be due to missing role column\n');
    }

    // Try to find admin user specifically
    console.log('4. Looking for admin@example.com...');
    try {
      const adminUser = await User.findOne({ 
        where: { email: 'admin@example.com' },
        attributes: ['id', 'email', 'role']
      });
      
      if (adminUser) {
        console.log('✅ Found admin user:');
        console.log(`   - ID: ${adminUser.id}`);
        console.log(`   - Email: ${adminUser.email}`);
        console.log(`   - Role: ${adminUser.role || 'undefined'}`);
      } else {
        console.log('❌ admin@example.com not found');
      }
      console.log('');
    } catch (error) {
      console.log('❌ Error finding admin user:', error.message, '\n');
    }

    // Test password comparison
    console.log('5. Testing password comparison...');
    try {
      const testUser = await User.findOne({ where: { email: 'admin@example.com' } });
      if (testUser) {
        const isPasswordValid = testUser.comparePassword('admin123');
        console.log(`🔐 Password 'admin123' is ${isPasswordValid ? 'VALID' : 'INVALID'} for admin@example.com`);
      } else {
        console.log('❌ Cannot test password - admin user not found');
      }
      console.log('');
    } catch (error) {
      console.log('❌ Error testing password:', error.message, '\n');
    }

    // Check User model attributes
    console.log('6. User model attributes:');
    const modelAttributes = Object.keys(User.rawAttributes);
    console.log('📝 Model expects these fields:', modelAttributes.join(', '));
    console.log('');

    // Recommendations
    console.log('🔧 RECOMMENDATIONS:');
    
    // Check if role column exists in model but not in DB
    const hasRoleInModel = modelAttributes.includes('role');
    console.log(`   - Role in model: ${hasRoleInModel ? 'YES' : 'NO'}`);
    
    if (hasRoleInModel) {
      console.log('   - ✅ Model has role field');
      console.log('   - 💡 If login fails, the database table might be missing the role column');
      console.log('   - 💡 Try running: node backend/scripts/fixDatabase.js');
    } else {
      console.log('   - ❌ Model missing role field - check User model definition');
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. If role column is missing from database, run the fix script');
    console.log('   2. If admin user doesn\'t exist, create one');
    console.log('   3. If password test fails, recreate the admin user');
    console.log('   4. Check server logs for more detailed error messages');

  } catch (error) {
    console.error('❌ Debug script failed:', error);
    console.log('\n💡 Common issues:');
    console.log('   - Database connection problems (check .env file)');
    console.log('   - Database server not running');
    console.log('   - User table doesn\'t exist');
  }
};

debugUser();
