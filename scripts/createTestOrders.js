const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const sequelize = require('../config/db');

const createTestOrders = async () => {
  try {
    console.log('📋 Creating Test Orders...\n');
    
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // Find the test user
    const testUser = await User.findOne({
      where: { email: 'user@example.com' }
    });
    
    if (!testUser) {
      console.log('❌ Test user not found. Please run createTestUser.js first');
      return;
    }
    
    console.log(`✅ Found test user: ${testUser.email} (ID: ${testUser.id})`);
    
    // Get some products to create orders with
    const products = await Product.findAll({ limit: 5 });
    
    if (products.length === 0) {
      console.log('❌ No products found. Creating sample products...');
      
      // Create sample products
      const sampleProducts = await Product.bulkCreate([
        {
          name: 'Test T-Shirt',
          short_name: 'T-Shirt',
          price: 999,
          discount: 10,
          stock: 50,
          description: 'Comfortable cotton t-shirt',
          subcategory_id: 1,
          is_active: true,
          image_url: 'img/prod-1.jpg'
        },
        {
          name: 'Test Jeans',
          short_name: 'Jeans',
          price: 1999,
          discount: 15,
          stock: 30,
          description: 'Stylish denim jeans',
          subcategory_id: 1,
          is_active: true,
          image_url: 'img/prod-2.jpg'
        },
        {
          name: 'Test Watch',
          short_name: 'Watch',
          price: 2999,
          discount: 20,
          stock: 20,
          description: 'Elegant wrist watch',
          subcategory_id: 1,
          is_active: true,
          image_url: 'img/prod-3.jpg'
        }
      ]);
      
      console.log(`✅ Created ${sampleProducts.length} sample products`);
      products.push(...sampleProducts);
    }
    
    console.log(`✅ Found ${products.length} products to use for orders`);
    
    // Delete existing test orders for this user
    await Order.destroy({
      where: { user_id: testUser.id }
    });
    
    // Create test orders
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const testOrders = [
      {
        order_number: `ORD-${Date.now()}-001`,
        user_id: testUser.id,
        customer_email: testUser.email,
        customer_name: 'Test User',
        shipping_address: {
          name: 'Test User',
          phone: '9876543210',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456'
        },
        order_items: [],
        subtotal: 1799,
        discount_amount: 200,
        total_amount: 1699,
        order_status: 'confirmed',
        fulfillment_status: 'pending',
        payment_status: 'paid',
        created_at: today
      },
      {
        order_number: `ORD-${Date.now()}-002`,
        user_id: testUser.id,
        customer_email: testUser.email,
        customer_name: 'Test User',
        shipping_address: {
          name: 'Test User',
          phone: '9876543210',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456'
        },
        order_items: [],
        subtotal: 2999,
        discount_amount: 300,
        total_amount: 2799,
        order_status: 'confirmed',
        fulfillment_status: 'fulfilled',
        payment_status: 'paid',
        created_at: yesterday
      },
      {
        order_number: `ORD-${Date.now()}-003`,
        user_id: testUser.id,
        customer_email: testUser.email,
        customer_name: 'Test User',
        shipping_address: {
          name: 'Test User',
          phone: '9876543210',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456'
        },
        order_items: [],
        subtotal: 999,
        discount_amount: 100,
        total_amount: 999,
        order_status: 'confirmed',
        fulfillment_status: 'fulfilled',
        payment_status: 'paid',
        created_at: lastWeek
      }
    ];
    
    const createdOrders = await Order.bulkCreate(testOrders);
    console.log(`✅ Created ${createdOrders.length} test orders`);
    
    // Create order items for each order
    const orderItems = [];
    
    // Order 1 items
    orderItems.push({
      order_id: createdOrders[0].id,
      product_id: products[0].id,
      product_name: products[0].name,
      product_image: products[0].image_url,
      quantity: 2,
      unit_price: products[0].price,
      final_price: products[0].price * (1 - products[0].discount / 100),
      line_total: 2 * products[0].price * (1 - products[0].discount / 100),
      product_attributes: { size: 'L', color: 'Blue' }
    });
    
    // Order 2 items
    orderItems.push({
      order_id: createdOrders[1].id,
      product_id: products[1].id,
      product_name: products[1].name,
      product_image: products[1].image_url,
      quantity: 1,
      unit_price: products[1].price,
      final_price: products[1].price * (1 - products[1].discount / 100),
      line_total: products[1].price * (1 - products[1].discount / 100),
      product_attributes: { size: 'M', color: 'Black' }
    });
    
    orderItems.push({
      order_id: createdOrders[1].id,
      product_id: products[2].id,
      product_name: products[2].name,
      product_image: products[2].image_url,
      quantity: 1,
      unit_price: products[2].price,
      final_price: products[2].price * (1 - products[2].discount / 100),
      line_total: products[2].price * (1 - products[2].discount / 100),
      product_attributes: { color: 'Silver' }
    });
    
    // Order 3 items
    orderItems.push({
      order_id: createdOrders[2].id,
      product_id: products[0].id,
      product_name: products[0].name,
      product_image: products[0].image_url,
      quantity: 1,
      unit_price: products[0].price,
      final_price: products[0].price * (1 - products[0].discount / 100),
      line_total: products[0].price * (1 - products[0].discount / 100),
      product_attributes: { size: 'XL', color: 'Red' }
    });
    
    await OrderItem.bulkCreate(orderItems);
    console.log(`✅ Created ${orderItems.length} order items`);
    
    console.log('\n🎉 Test orders created successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - User: ${testUser.email}`);
    console.log(`   - Orders: ${createdOrders.length}`);
    console.log(`   - Order Items: ${orderItems.length}`);
    console.log('\n🔗 You can now test the orders page at: http://localhost:5000/orders.html');
    
  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  } finally {
    await sequelize.close();
  }
};

createTestOrders();
