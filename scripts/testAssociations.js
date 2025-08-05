const sequelize = require('../config/db');

const testAssociations = async () => {
  try {
    console.log('🔍 Testing Model Associations...\n');
    
    // Step 1: Import models individually
    console.log('1️⃣ Importing models...');
    const User = require('../models/user');
    const VendorProfile = require('../models/vendorProfile');
    console.log('✅ Models imported successfully\n');

    // Step 2: Define associations manually
    console.log('2️⃣ Defining associations...');
    
    // Clear any existing associations
    User.associations = {};
    VendorProfile.associations = {};
    
    // Define associations
    User.hasOne(VendorProfile, {
      foreignKey: 'user_id',
      as: 'vendorProfile'
    });
    
    VendorProfile.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    console.log('✅ Associations defined');
    console.log(`   User associations: ${Object.keys(User.associations)}`);
    console.log(`   VendorProfile associations: ${Object.keys(VendorProfile.associations)}\n`);

    // Step 3: Test database connection
    console.log('3️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Step 4: Create test data
    console.log('4️⃣ Creating test data...');
    const testEmail = `test-assoc-${Date.now()}@example.com`;
    
    const testUser = await User.create({
      email: testEmail,
      password: 'testpassword123',
      role: 'vendor'
    });
    
    const testProfile = await VendorProfile.create({
      user_id: testUser.id,
      business_name: 'Test Association Business',
      contact_name: 'Test Contact',
      mobile_number: '+1234567890'
    });
    
    console.log('✅ Test data created');
    console.log(`   User ID: ${testUser.id}`);
    console.log(`   Profile ID: ${testProfile.id}\n`);

    // Step 5: Test association query
    console.log('5️⃣ Testing association query...');
    
    try {
      const userWithProfile = await User.findOne({
        where: { email: testEmail },
        include: [{
          model: VendorProfile,
          as: 'vendorProfile'
        }]
      });
      
      if (userWithProfile && userWithProfile.vendorProfile) {
        console.log('✅ Association query successful!');
        console.log(`   User: ${userWithProfile.email}`);
        console.log(`   Business: ${userWithProfile.vendorProfile.business_name}`);
      } else {
        console.log('❌ Association query failed');
        console.log(`   User found: ${!!userWithProfile}`);
        console.log(`   Profile attached: ${!!userWithProfile?.vendorProfile}`);
      }
    } catch (error) {
      console.log('❌ Association query error:', error.message);
      
      // Try reverse association
      console.log('\n   Trying reverse association...');
      try {
        const profileWithUser = await VendorProfile.findOne({
          where: { user_id: testUser.id },
          include: [{
            model: User,
            as: 'user'
          }]
        });
        
        if (profileWithUser && profileWithUser.user) {
          console.log('✅ Reverse association working!');
          console.log(`   Business: ${profileWithUser.business_name}`);
          console.log(`   User: ${profileWithUser.user.email}`);
        } else {
          console.log('❌ Reverse association also failed');
        }
      } catch (reverseError) {
        console.log('❌ Reverse association error:', reverseError.message);
      }
    }

    // Step 6: Test manual queries
    console.log('\n6️⃣ Testing manual queries...');
    
    const manualUser = await User.findOne({ where: { email: testEmail } });
    const manualProfile = await VendorProfile.findOne({ where: { user_id: manualUser.id } });
    
    if (manualUser && manualProfile) {
      console.log('✅ Manual queries working');
      console.log(`   User: ${manualUser.email}`);
      console.log(`   Business: ${manualProfile.business_name}`);
      console.log('   → The data relationship exists, issue is with Sequelize associations');
    } else {
      console.log('❌ Manual queries failed');
    }

    // Step 7: Clean up
    console.log('\n7️⃣ Cleaning up...');
    await VendorProfile.destroy({ where: { user_id: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Association test completed!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Association test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Run the test
testAssociations();
