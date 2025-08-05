const User = require('../models/user');
const Product = require('../models/product');
const sequelize = require('../config/db');

async function testVendorStats() {
  try {
    console.log('🧪 Testing vendor stats API logic...');
    
    // Find the vendor user
    const vendor = await User.findOne({
      where: { email: 'vendor@example.com' }
    });
    
    if (!vendor) {
      console.log('❌ Vendor not found');
      return;
    }
    
    console.log(`✅ Found vendor: ${vendor.email} (ID: ${vendor.id})`);
    
    // Test product statistics
    const productCount = await Product.count({
      where: { vendor_id: vendor.id }
    });
    
    const products = await Product.findAll({
      where: { vendor_id: vendor.id },
      attributes: ['id', 'name', 'stock', 'price', 'discount']
    });
    
    const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
    const lowStockProducts = products.filter(product => (product.stock || 0) < 10).length;
    
    console.log('\n📊 Product Statistics:');
    console.log(`   Total Products: ${productCount}`);
    console.log(`   Total Stock: ${totalStock}`);
    console.log(`   Low Stock Products: ${lowStockProducts}`);
    
    console.log('\n📦 Products:');
    products.forEach(product => {
      console.log(`   - ${product.name}: Stock ${product.stock}, Price ₹${product.price}`);
    });
    
    // Test the actual stats response format
    const statsResponse = {
      success: true,
      message: 'Vendor statistics retrieved successfully',
      data: {
        stats: {
          totalProducts: productCount,
          totalStock,
          lowStockProducts,
          sales: {
            today: {
              amount: 0,
              orders: 0
            },
            thisMonth: {
              amount: 0,
              orders: 0,
              growthPercentage: 0
            },
            lastMonth: {
              amount: 0,
              orders: 0
            }
          },
          recentProducts: products.slice(0, 5),
          recentOrders: []
        }
      }
    };
    
    console.log('\n📡 API Response Format:');
    console.log(JSON.stringify(statsResponse, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing vendor stats:', error);
  } finally {
    await sequelize.close();
  }
}

testVendorStats();
