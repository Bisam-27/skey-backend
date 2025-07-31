const fs = require('fs');
const path = require('path');

async function cleanupTestFiles() {
  console.log('🧹 Cleaning up test files...\n');

  const testFilesToRemove = [
    // Test files that are no longer needed
    'backend/test/debugCoupon.js',
    'backend/test/testServer.js',
    'backend/startAndTest.js',
    
    // Keep these files as they might be useful for future testing:
    // 'backend/test/couponSystem.test.js',
    // 'backend/test/couponIntegration.test.js', 
    // 'backend/test/manualCouponTest.js',
    // 'backend/test/runTests.js',
    // 'backend/scripts/testCouponAPIs.js'
  ];

  const optionalTestFiles = [
    // These can be removed if you don't want them
    'backend/scripts/testCouponAPIs.js',
    'backend/test/couponSystem.test.js',
    'backend/test/couponIntegration.test.js'
  ];

  let removedCount = 0;

  // Remove test files
  for (const filePath of testFilesToRemove) {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`✅ Removed: ${filePath}`);
        removedCount++;
      } else {
        console.log(`ℹ️ Not found: ${filePath}`);
      }
    } catch (error) {
      console.log(`❌ Failed to remove ${filePath}: ${error.message}`);
    }
  }

  console.log(`\n📊 Cleanup Summary:`);
  console.log(`   Files removed: ${removedCount}`);
  
  console.log(`\n📋 Files kept for future use:`);
  console.log(`   ✅ backend/test/manualCouponTest.js - Interactive testing`);
  console.log(`   ✅ backend/test/runTests.js - System health checks`);
  console.log(`   ✅ backend/test/README.md - Testing documentation`);
  console.log(`   ✅ backend/scripts/createCouponTables.js - Database setup`);
  console.log(`   ✅ backend/scripts/cleanupTestData.js - Data cleanup`);

  console.log(`\n🤔 Optional files you can remove if not needed:`);
  for (const filePath of optionalTestFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`   📄 ${filePath} - Advanced testing (can be removed)`);
    }
  }

  console.log(`\n✅ Test file cleanup completed!`);
}

// Function to show what files exist
function showTestFiles() {
  console.log('📋 Current test files:\n');

  const testDirectories = [
    'backend/test',
    'backend/scripts'
  ];

  for (const dir of testDirectories) {
    const fullDir = path.join(process.cwd(), dir);
    if (fs.existsSync(fullDir)) {
      console.log(`📁 ${dir}/`);
      const files = fs.readdirSync(fullDir);
      files.forEach(file => {
        if (file.includes('test') || file.includes('Test') || file.includes('debug') || file.includes('Debug')) {
          console.log(`   📄 ${file}`);
        }
      });
      console.log('');
    }
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'clean';

  switch (command) {
    case 'clean':
      cleanupTestFiles();
      break;
    case 'list':
      showTestFiles();
      break;
    default:
      console.log('Usage: node cleanupTestFiles.js [clean|list]');
      console.log('  clean - Remove unnecessary test files (default)');
      console.log('  list  - Show current test files');
  }
}

module.exports = { cleanupTestFiles, showTestFiles };
