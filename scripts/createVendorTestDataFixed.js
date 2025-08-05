const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Subcategory = require('../models/subcategory');
const sequelize = require('../config/db');

async function createVendorTestData() {
  try {
    console.log('🏗️ Creating test data for vendor dashboard...');
    
    // Find the vendor user
    const vendor = await User.findOne({
      where: { email: 'vendor@example.com' }
    });
    
    if (!vendor) {
      console.log('❌ Vendor not found');
      return;
    }
    
    console.log(`✅ Found vendor: ${vendor.email} (ID: ${vendor.id})`);
    
    // Find available subcategories
    const subcategories = await Subcategory.findAll({
      limit: 5,
      attributes: ['id', 'name']
    });
    
    console.log('📂 Available subcategories:', subcategories.map(s => `${s.id}: ${s.name}`));
    
    if (subcategories.length === 0) {
      console.log('❌ No subcategories found, cannot create products');
      return;
    }
    
    const subcategoryId = subcategories[0].id;
    
    // Create some test products for the vendor
    console.log('\n📦 Creating test products...');
    
    const testProducts = [
      {
        name: 'Premium Cotton T-Shirt',
        short_name: 'Cotton Tee',
        price: 1299,
        discount: 10,
        stock: 50,
        description: 'High quality cotton t-shirt',
        vendor_id: vendor.id,
        subcategory_id: subcategoryId,
        is_active: true
      },
      {
        name: 'Denim Jeans',
        short_name: 'Jeans',
        price: 2499,
        discount: 15,
        stock: 8, // Low stock
        description: 'Comfortable denim jeans',
        vendor_id: vendor.id,
        subcategory_id: subcategoryId,
        is_active: true
      },
      {
        name: 'Casual Shirt',
        short_name: 'Shirt',
        price: 1899,
        discount: 5,
        stock: 25,
        description: 'Casual cotton shirt',
        vendor_id: vendor.id,
        subcategory_id: subcategoryId,
        is_active: true
      },
      {
        name: 'Sports Shoes',
        short_name: 'Shoes',
        price: 3999,
        discount: 20,
        stock: 5, // Low stock
        description: 'Comfortable sports shoes',
        vendor_id: vendor.id,
        subcategory_id: subcategoryId,
        is_active: true
      }
    ];
    
    // Delete existing test products for this vendor
    await Product.destroy({
      where: { vendor_id: vendor.id }
    });
    
    const createdProducts = await Product.bulkCreate(testProducts);
    console.log(`✅ Created ${createdProducts.length} test products`);
    
    // Create some test orders
    console.log('\n📋 Creating test orders...');
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const testOrders = [
      {
        order_number: 'ORD-' + Date.now() + '-1',
        customer_email: 'customer1@example.com',
        customer_name: 'John Doe',
        total_amount: 2338, // 2 * 1169 (t-shirts after discount)
        order_status: 'confirmed',
        fulfillment_status: 'unfulfilled',
        created_at: today
      },
      {
        order_number: 'ORD-' + Date.now() + '-2',
        customer_email: 'customer2@example.com',
        customer_name: 'Jane Smith',
        total_amount: 2124, // 1 * 2124 (jeans after discount)
        order_status: 'shipped',
        fulfillment_status: 'fulfilled',
        created_at: yesterday
      },
      {
        order_number: 'ORD-' + Date.now() + '-3',
        customer_email: 'customer3@example.com',
        customer_name: 'Bob Wilson',
        total_amount: 3199, // 1 * 3199 (shoes after discount)
        order_status: 'delivered',
        fulfillment_status: 'fulfilled',
        created_at: lastWeek
      }
    ];
    
    const createdOrders = await Order.bulkCreate(testOrders);
    console.log(`✅ Created ${createdOrders.length} test orders`);
    
    // Create order items
    console.log('\n📦 Creating order items...');
    
    const orderItems = [
      // Order 1: 2 t-shirts
      {
        order_id: createdOrders[0].id,
        product_id: createdProducts[0].id,
        product_name: createdProducts[0].name,
        vendor_id: vendor.id,
        quantity: 2,
        unit_price: 1299,
        discount_per_item: 130, // 10% discount
        final_price: 1169,
        line_total: 2338
      },
      // Order 2: 1 jeans
      {
        order_id: createdOrders[1].id,
        product_id: createdProducts[1].id,
        product_name: createdProducts[1].name,
        vendor_id: vendor.id,
        quantity: 1,
        unit_price: 2499,
        discount_per_item: 375, // 15% discount
        final_price: 2124,
        line_total: 2124
      },
      // Order 3: 1 shoes
      {
        order_id: createdOrders[2].id,
        product_id: createdProducts[3].id,
        product_name: createdProducts[3].name,
        vendor_id: vendor.id,
        quantity: 1,
        unit_price: 3999,
        discount_per_item: 800, // 20% discount
        final_price: 3199,
        line_total: 3199
      }
    ];
    
    await OrderItem.bulkCreate(orderItems);
    console.log(`✅ Created ${orderItems.length} order items`);
    
    console.log('\n🎉 Test data creation completed!');
    console.log('📊 Dashboard should now show:');
    console.log(`   - ${createdProducts.length} total products`);
    console.log(`   - ${createdProducts.reduce((sum, p) => sum + p.stock, 0)} total stock`);
    console.log(`   - ${createdProducts.filter(p => p.stock < 10).length} low stock products`);
    console.log(`   - ${createdOrders.length} recent orders`);
    console.log(`   - Total sales: ₹${orderItems.reduce((sum, item) => sum + item.line_total, 0)}`);
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await sequelize.close();
  }
}

createVendorTestData();
