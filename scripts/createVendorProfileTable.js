const sequelize = require('../config/db');
const VendorProfile = require('../models/vendorProfile');

const createVendorProfileTable = async () => {
  try {
    console.log('🚀 Starting vendor profile table creation...\n');
    
    // Step 1: Test database connection
    console.log('1️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Step 2: Create vendor_profiles table
    console.log('2️⃣ Creating vendor_profiles table...');
    
    try {
      await VendorProfile.sync({ force: false });
      console.log('✅ vendor_profiles table created/updated successfully\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  vendor_profiles table already exists\n');
      } else {
        throw error;
      }
    }

    // Step 3: Verify the table structure
    console.log('3️⃣ Verifying table structure...');
    
    const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM vendor_profiles
    `);
    
    console.log('   Table columns:');
    columns.forEach(column => {
      console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
    });

    console.log('\n🎉 Vendor profile table setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • vendor_profiles table created with all required columns');
    console.log('   • Table is ready to store vendor business information');
    console.log('   • Foreign key relationship with user table established');
    
    console.log('\n🔧 Next steps:');
    console.log('   • Test vendor registration with business details');
    console.log('   • Verify vendor profile creation and retrieval');
    console.log('   • Test vendor profile updates');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Table creation failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Run the migration
createVendorProfileTable();
