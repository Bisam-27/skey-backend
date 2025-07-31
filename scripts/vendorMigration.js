const sequelize = require('../config/db');
const User = require('../models/user');
const Product = require('../models/product');

const migrateVendorSchema = async () => {
  try {
    console.log('🚀 Starting vendor schema migration...\n');
    
    // Step 1: Test database connection
    console.log('1️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Step 2: Update User table to support vendor role
    console.log('2️⃣ Updating User table to support vendor role...');
    console.log('   This will modify the role ENUM to include "vendor"');
    
    try {
      // First, let's check current role enum values
      const [results] = await sequelize.query(`
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
        AND TABLE_NAME = 'user' 
        AND COLUMN_NAME = 'role'
      `);
      
      console.log('   Current role enum:', results[0]?.COLUMN_TYPE || 'Not found');
      
      // Update the ENUM to include vendor
      await sequelize.query(`
        ALTER TABLE user 
        MODIFY COLUMN role ENUM('user', 'admin', 'vendor') 
        NOT NULL DEFAULT 'user'
      `);
      
      console.log('✅ User table updated successfully\n');
    } catch (error) {
      if (error.message.includes('Duplicate entry')) {
        console.log('⚠️  User table already has vendor role support\n');
      } else {
        throw error;
      }
    }

    // Step 3: Add vendor_id column to Product table
    console.log('3️⃣ Adding vendor_id column to Product table...');
    
    try {
      await sequelize.query(`
        ALTER TABLE product 
        ADD COLUMN vendor_id INT NULL 
        COMMENT 'Reference to user table for vendor who owns this product'
      `);
      
      console.log('✅ Product table updated successfully\n');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('⚠️  Product table already has vendor_id column\n');
      } else {
        throw error;
      }
    }

    // Step 4: Sync models to ensure everything is up to date
    console.log('4️⃣ Syncing models with database...');
    await User.sync({ alter: true });
    await Product.sync({ alter: true });
    console.log('✅ Models synced successfully\n');

    // Step 5: Create a test vendor account (optional)
    console.log('5️⃣ Creating test vendor account...');
    
    try {
      const testVendor = await User.findOrCreate({
        where: { email: 'vendor@example.com' },
        defaults: {
          email: 'vendor@example.com',
          password: 'vendor123',
          role: 'vendor'
        }
      });
      
      if (testVendor[1]) {
        console.log('✅ Test vendor account created:');
        console.log('   Email: vendor@example.com');
        console.log('   Password: vendor123');
        console.log('   Role: vendor\n');
      } else {
        console.log('⚠️  Test vendor account already exists\n');
      }
    } catch (error) {
      console.log('⚠️  Could not create test vendor account:', error.message, '\n');
    }

    // Step 6: Verify the migration
    console.log('6️⃣ Verifying migration...');
    
    // Check if we can create a vendor user
    const vendorCount = await User.count({ where: { role: 'vendor' } });
    console.log(`   Found ${vendorCount} vendor(s) in database`);
    
    // Check if product table has vendor_id column
    const [productColumns] = await sequelize.query(`
      SHOW COLUMNS FROM product LIKE 'vendor_id'
    `);
    
    if (productColumns.length > 0) {
      console.log('   ✅ Product table has vendor_id column');
    } else {
      console.log('   ❌ Product table missing vendor_id column');
    }

    console.log('\n🎉 Vendor schema migration completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('   • User table role enum updated to include "vendor"');
    console.log('   • Product table now has vendor_id column');
    console.log('   • Test vendor account created (if not exists)');
    console.log('\n🔧 Next steps:');
    console.log('   • Start your server: npm start');
    console.log('   • Test vendor registration: POST /api/vendor/register');
    console.log('   • Test vendor login: POST /api/vendor/login');
    console.log('   • Test vendor product creation: POST /api/vendor/products');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Run the migration
if (require.main === module) {
  migrateVendorSchema();
}

module.exports = migrateVendorSchema;
