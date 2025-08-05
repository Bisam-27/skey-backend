const fs = require('fs');
const path = require('path');

const updateVendorPages = () => {
  console.log('🔧 Updating Vendor Panel Pages...\n');
  
  const vendorPanelDir = path.join(__dirname, '../../vendor pannel');
  
  // List of HTML files to update (excluding login and register which already have JS)
  const filesToUpdate = [
    'add-product.html',
    'modify-discounts.html',
    'modify-product.html',
    'orders-fulfilled.html',
    'orders-unfulfilled.html',
    'payment-history.html',
    'returns-fulfilled.html',
    'returns-unfulfilled.html',
    'select-product.html',
    'success.html'
  ];
  
  const jsIncludes = `    
    <!-- JavaScript -->
    <script src="js/vendor-auth.js"></script>
    <script src="js/vendor-dashboard.js"></script>`;
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  filesToUpdate.forEach(filename => {
    const filePath = path.join(vendorPanelDir, filename);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filename}`);
        skippedCount++;
        return;
      }
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file already has the JavaScript includes
      if (content.includes('vendor-auth.js') && content.includes('vendor-dashboard.js')) {
        console.log(`✅ Already updated: ${filename}`);
        skippedCount++;
        return;
      }
      
      // Check if file has logout.html link (only update files that need logout functionality)
      if (!content.includes('logout.html')) {
        console.log(`⏭️  No logout link found: ${filename}`);
        skippedCount++;
        return;
      }
      
      // Find the closing body tag and add JavaScript before it
      const bodyCloseRegex = /(\s*<\/body>\s*<\/html>)/;
      
      if (bodyCloseRegex.test(content)) {
        content = content.replace(bodyCloseRegex, `${jsIncludes}\n  </body>\n</html>`);
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filename}`);
        updatedCount++;
      } else {
        console.log(`⚠️  Could not find closing body tag in: ${filename}`);
        skippedCount++;
      }
      
    } catch (error) {
      console.log(`❌ Error updating ${filename}: ${error.message}`);
      skippedCount++;
    }
  });
  
  console.log(`\n📊 Update Summary:`);
  console.log(`   ✅ Updated: ${updatedCount} files`);
  console.log(`   ⏭️  Skipped: ${skippedCount} files`);
  
  if (updatedCount > 0) {
    console.log(`\n🎉 Successfully updated ${updatedCount} vendor panel pages!`);
    console.log(`\n🧪 Test Instructions:`);
    console.log(`1. Start your server: npm start`);
    console.log(`2. Login to vendor panel: http://localhost:5000/vendor pannel/login.html`);
    console.log(`3. Use credentials: vendor@example.com / vendor123`);
    console.log(`4. Navigate to any page and click "Logout"`);
    console.log(`5. Should redirect to login page instead of showing 404 error`);
  }
  
  console.log(`\n✅ Vendor panel pages update completed!`);
};

// Run the update
updateVendorPages();
