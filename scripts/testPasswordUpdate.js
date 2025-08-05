const User = require('../models/user');
const VendorProfile = require('../models/vendorProfile');
const sequelize = require('../config/db');

async function testPasswordUpdate() {
  try {
    console.log('🔍 Testing vendor password update...');
    
    // Find the vendor user
    const vendor = await User.findOne({
      where: { email: 'vendor@example.com' }
    });
    
    if (!vendor) {
      console.log('❌ Vendor not found');
      return;
    }
    
    console.log(`✅ Found vendor: ${vendor.email} (ID: ${vendor.id})`);
    
    // Test current password
    const currentPassword = 'vendor123';
    const isCurrentPasswordValid = vendor.comparePassword(currentPassword);
    console.log(`🔐 Current password '${currentPassword}' valid: ${isCurrentPasswordValid}`);
    
    if (!isCurrentPasswordValid) {
      console.log('❌ Current password is incorrect, cannot proceed with test');
      return;
    }
    
    // Test password update
    const newPassword = 'newvendor123';
    console.log(`\n🔄 Updating password to '${newPassword}'...`);
    
    // Update the password
    await vendor.update({ password: newPassword });
    console.log('✅ Password updated in database');
    
    // Reload vendor to get fresh data
    await vendor.reload();
    
    // Test new password
    const isNewPasswordValid = vendor.comparePassword(newPassword);
    console.log(`🔐 New password '${newPassword}' valid: ${isNewPasswordValid}`);
    
    // Test old password should fail
    const isOldPasswordStillValid = vendor.comparePassword(currentPassword);
    console.log(`🔐 Old password '${currentPassword}' still valid: ${isOldPasswordStillValid}`);
    
    if (isNewPasswordValid && !isOldPasswordStillValid) {
      console.log('✅ Password update test PASSED!');
      
      // Restore original password for future tests
      console.log('\n🔄 Restoring original password...');
      await vendor.update({ password: currentPassword });
      console.log('✅ Original password restored');
    } else {
      console.log('❌ Password update test FAILED!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

testPasswordUpdate();
