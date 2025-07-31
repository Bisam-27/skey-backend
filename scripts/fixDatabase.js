// Load environment variables from backend directory
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const sequelize = require('../config/db');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const fixDatabase = async () => {
  try {
    console.log('🔧 Starting comprehensive database fix...\n');
    
    // Step 1: Test connection
    console.log('1️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Step 2: Force sync the User model (this will create/update the table)
    console.log('2️⃣ Syncing User model with database...');
    console.log('   This will create the user table if it doesn\'t exist');
    console.log('   Or add missing columns like \'role\' if they\'re missing');
    
    await User.sync({ alter: true, force: false });
    console.log('✅ User model synced successfully\n');

    // Step 3: Check table structure after sync
    console.log('3️⃣ Verifying table structure...');
    const [columns] = await sequelize.query('DESCRIBE user');
    console.log('📋 Current table structure:');
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(required)' : '(optional)'} ${col.Default ? `default: ${col.Default}` : ''}`);
    });
    
    // Check if role column exists
    const hasRoleColumn = columns.some(col => col.Field === 'role');
    if (hasRoleColumn) {
      console.log('✅ Role column exists');
    } else {
      console.log('❌ Role column missing - this is the problem!');
      throw new Error('Role column still missing after sync');
    }
    console.log('');

    // Step 4: Handle admin user
    console.log('4️⃣ Setting up admin user...');
    
    // Check if admin user exists
    let adminUser = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (adminUser) {
      console.log('👤 Admin user exists, checking role...');
      if (adminUser.role !== 'admin') {
        console.log('🔄 Updating user role to admin...');
        await adminUser.update({ role: 'admin' });
        console.log('✅ Role updated to admin');
      } else {
        console.log('✅ User already has admin role');
      }
      
      // Verify password
      const isPasswordCorrect = adminUser.comparePassword('admin123');
      if (!isPasswordCorrect) {
        console.log('🔄 Updating password...');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        await sequelize.query(
          'UPDATE user SET password = ? WHERE email = ?',
          { replacements: [hashedPassword, 'admin@example.com'] }
        );
        console.log('✅ Password updated');
      } else {
        console.log('✅ Password is correct');
      }
    } else {
      console.log('👤 Creating new admin user...');
      adminUser = await User.create({
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created');
    }
    console.log('');

    // Step 5: Test the admin user
    console.log('5️⃣ Testing admin user login...');
    const testUser = await User.findOne({ 
      where: { email: 'admin@example.com' },
      attributes: ['id', 'email', 'role', 'password']
    });
    
    if (testUser) {
      console.log('✅ Admin user found in database');
      console.log(`   ID: ${testUser.id}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Role: ${testUser.role}`);
      
      const passwordTest = testUser.comparePassword('admin123');
      console.log(`   Password test: ${passwordTest ? '✅ PASS' : '❌ FAIL'}`);
      
      if (passwordTest && testUser.role === 'admin') {
        console.log('🎉 Admin user is ready for login!');
      } else {
        console.log('❌ Admin user has issues');
      }
    } else {
      console.log('❌ Admin user not found after creation');
    }
    console.log('');

    // Step 6: Summary
    console.log('📊 FINAL STATUS:');
    const totalUsers = await User.count();
    const adminCount = await User.count({ where: { role: 'admin' } });
    const regularCount = await User.count({ where: { role: 'user' } });
    
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Admin users: ${adminCount}`);
    console.log(`   Regular users: ${regularCount}`);
    console.log('');

    console.log('🔑 ADMIN CREDENTIALS:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('');

    console.log('🧪 TEST YOUR LOGIN:');
    console.log('   curl -X POST "http://localhost:5000/api/auth/login" \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"email": "admin@example.com", "password": "admin123"}\'');
    console.log('');

    console.log('✅ Database fix completed successfully!');
    console.log('🚀 You should now be able to login with the admin credentials.');

  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    console.log('\n🔍 ERROR DETAILS:');
    console.log(error);
    
    console.log('\n💡 MANUAL STEPS TO TRY:');
    console.log('1. Check if your MySQL server is running');
    console.log('2. Verify database credentials in .env file');
    console.log('3. Try connecting to your database manually');
    console.log('4. Check if the database exists');
    
    if (error.message.includes('Unknown column')) {
      console.log('5. The role column is still missing - try running this script again');
    }
  }
};

fixDatabase();
