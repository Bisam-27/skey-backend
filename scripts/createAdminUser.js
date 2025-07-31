// Load environment variables from backend directory
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const sequelize = require('../config/db');
const User = require('../models/user');

const createAdminUser = async () => {
  try {
    console.log('🔄 Starting admin user setup...');
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync User model to add the role field if it doesn't exist
    console.log('🔄 Syncing User model (this will add role column if missing)...');
    await User.sync({ alter: true });
    console.log('✅ User model synced.');

    // Check if admin user already exists
    let existingAdmin = await User.findOne({ where: { email: 'admin@example.com' } });

    if (existingAdmin) {
      console.log('👤 User admin@example.com already exists');

      // Check if they're already admin
      if (existingAdmin.role === 'admin') {
        console.log('✅ User is already an admin');
      } else {
        console.log('🔄 Updating user to admin role...');
        await existingAdmin.update({ role: 'admin' });
        console.log('✅ User updated to admin role');
      }
    } else {
      // Create admin user
      console.log('👤 Creating new admin user...');
      const adminEmail = 'admin@example.com';
      const adminPassword = 'admin123';

      existingAdmin = await User.create({
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });

      console.log('✅ Admin user created successfully!');
    }

    console.log('\n🔑 Admin credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('   Role:', existingAdmin.role);
    console.log('\n🎉 You can now use these credentials to login and test the admin APIs.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);

    // Provide helpful error messages
    if (error.message.includes('Unknown column')) {
      console.log('\n💡 This might be a database sync issue. The role column may not exist yet.');
      console.log('💡 Try running this script again, or check your database connection.');
    }

    process.exit(1);
  }
};

createAdminUser();
