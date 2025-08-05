const sequelize = require('../config/db');
const User = require('../models/user');

const migrateUserRole = async () => {
  try {
    console.log('🔄 Starting user role migration...');
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Check if role column exists
    let columnExists = false;
    try {
      const [results] = await sequelize.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'user'
        AND COLUMN_NAME = 'role'
        AND TABLE_SCHEMA = DATABASE()
      `);
      columnExists = results.length > 0;
    } catch (error) {
      console.log('⚠️  Could not check column existence, will try to add it...');
    }

    if (!columnExists) {
      console.log('📝 Adding role column to user table...');

      try {
        // Add the role column with default value
        await sequelize.query(`
          ALTER TABLE user
          ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
        `);
        console.log('✅ Role column added successfully!');
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log('✅ Role column already exists.');
        } else {
          throw error;
        }
      }
    } else {
      console.log('✅ Role column already exists.');
    }

    // Sync the User model to ensure everything is up to date
    console.log('🔄 Syncing User model...');
    await User.sync({ alter: true });
    console.log('✅ User model synced.');

    // Check if any admin users exist
    const adminCount = await User.count({ where: { role: 'admin' } });
    console.log(`📊 Current admin users: ${adminCount}`);

    if (adminCount === 0) {
      console.log('👤 Creating default admin user...');
      
      // Check if admin@example.com already exists
      const existingUser = await User.findOne({ where: { email: 'admin@example.com' } });
      
      if (existingUser) {
        // Update existing user to admin
        await existingUser.update({ role: 'admin' });
        console.log('✅ Updated existing user admin@example.com to admin role');
      } else {
        // Create new admin user
        const adminUser = await User.create({
          email: 'admin@example.com',
          password: 'admin123',
          role: 'admin'
        });
        console.log('✅ Created new admin user');
      }

      console.log('🔑 Admin credentials:');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    }

    // Display current user statistics
    const totalUsers = await User.count();
    const regularUsers = await User.count({ where: { role: 'user' } });
    const adminUsers = await User.count({ where: { role: 'admin' } });

    console.log('\n📈 User Statistics:');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Regular Users: ${regularUsers}`);
    console.log(`   Admin Users: ${adminUsers}`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('You can now login with admin credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // Provide helpful error messages
    if (error.message.includes('Unknown column')) {
      console.log('\n💡 Tip: Make sure your database is running and accessible.');
    } else if (error.message.includes('Access denied')) {
      console.log('\n💡 Tip: Check your database credentials in the .env file.');
    } else if (error.message.includes('connect ECONNREFUSED')) {
      console.log('\n💡 Tip: Make sure your MySQL/database server is running.');
    }
    
    process.exit(1);
  }
};

migrateUserRole();
