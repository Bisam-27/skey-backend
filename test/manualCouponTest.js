#!/usr/bin/env node

/**
 * Manual Coupon System Test
 * 
 * This script provides an interactive way to test the coupon system functionality.
 * Run this script and follow the prompts to test different features.
 */

const axios = require('axios');
const readline = require('readline');

const BASE_URL = 'http://localhost:5000/api';

class ManualCouponTester {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.vendorToken = null;
    this.customerToken = null;
  }

  async start() {
    console.log('🎯 Welcome to Coupon System Manual Tester\n');
    console.log('This tool will help you test the coupon functionality step by step.\n');

    try {
      await this.showMainMenu();
    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async showMainMenu() {
    console.log('\n📋 Main Menu:');
    console.log('1. Test Vendor Login & Coupon Creation');
    console.log('2. Test Customer Login & Coupon Validation');
    console.log('3. Test Complete Workflow');
    console.log('4. Test API Endpoints Directly');
    console.log('5. Exit');

    const choice = await this.askQuestion('\nSelect an option (1-5): ');

    switch (choice) {
      case '1':
        await this.testVendorWorkflow();
        break;
      case '2':
        await this.testCustomerWorkflow();
        break;
      case '3':
        await this.testCompleteWorkflow();
        break;
      case '4':
        await this.testAPIEndpoints();
        break;
      case '5':
        console.log('👋 Goodbye!');
        return;
      default:
        console.log('❌ Invalid option. Please try again.');
        await this.showMainMenu();
    }
  }

  async testVendorWorkflow() {
    console.log('\n🏪 Testing Vendor Workflow...\n');

    // Step 1: Vendor Login
    const vendorEmail = await this.askQuestion('Enter vendor email (or press Enter for default): ') || 'vendor@test.com';
    const vendorPassword = await this.askQuestion('Enter vendor password (or press Enter for default): ') || 'password123';

    try {
      console.log('🔐 Logging in as vendor...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: vendorEmail,
        password: vendorPassword
      });

      if (loginResponse.data.success) {
        this.vendorToken = loginResponse.data.data.token;
        console.log('✅ Vendor login successful!');
      } else {
        throw new Error('Login failed');
      }

      // Step 2: Get vendor products
      console.log('\n📦 Fetching vendor products...');
      const productsResponse = await axios.get(`${BASE_URL}/coupons/vendor/products`, {
        headers: { Authorization: `Bearer ${this.vendorToken}` }
      });

      console.log(`✅ Found ${productsResponse.data.data.length} products`);
      if (productsResponse.data.data.length > 0) {
        console.log('Sample products:');
        productsResponse.data.data.slice(0, 3).forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} - ₹${product.price}`);
        });
      }

      // Step 3: Get collections
      console.log('\n📂 Fetching collections...');
      const collectionsResponse = await axios.get(`${BASE_URL}/coupons/collections`, {
        headers: { Authorization: `Bearer ${this.vendorToken}` }
      });

      console.log(`✅ Found ${collectionsResponse.data.data.length} collections`);
      if (collectionsResponse.data.data.length > 0) {
        console.log('Available collections:');
        collectionsResponse.data.data.slice(0, 3).forEach((collection, index) => {
          console.log(`  ${index + 1}. ${collection.name}`);
        });
      }

      // Step 4: Create a test coupon
      const createCoupon = await this.askQuestion('\nWould you like to create a test coupon? (y/n): ');
      if (createCoupon.toLowerCase() === 'y') {
        await this.createTestCoupon(collectionsResponse.data.data, productsResponse.data.data);
      }

      // Step 5: View existing coupons
      console.log('\n🎫 Fetching existing coupons...');
      const couponsResponse = await axios.get(`${BASE_URL}/coupons/vendor/coupons`, {
        headers: { Authorization: `Bearer ${this.vendorToken}` }
      });

      console.log(`✅ Found ${couponsResponse.data.data.coupons.length} coupons`);
      if (couponsResponse.data.data.coupons.length > 0) {
        console.log('Your coupons:');
        couponsResponse.data.data.coupons.forEach((coupon, index) => {
          console.log(`  ${index + 1}. ${coupon.code} - ${coupon.coupon_type} ${coupon.discount_value}${coupon.coupon_type === 'discount' ? '%' : '₹'} off`);
        });
      }

    } catch (error) {
      console.error('❌ Vendor workflow error:', error.response?.data?.message || error.message);
    }

    await this.showMainMenu();
  }

  async testCustomerWorkflow() {
    console.log('\n🛒 Testing Customer Workflow...\n');

    // Step 1: Customer Login
    const customerEmail = await this.askQuestion('Enter customer email (or press Enter for default): ') || 'customer@test.com';
    const customerPassword = await this.askQuestion('Enter customer password (or press Enter for default): ') || 'password123';

    try {
      console.log('🔐 Logging in as customer...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: customerEmail,
        password: customerPassword
      });

      if (loginResponse.data.success) {
        this.customerToken = loginResponse.data.data.token;
        console.log('✅ Customer login successful!');
      } else {
        throw new Error('Login failed');
      }

      // Step 2: Test coupon validation
      const couponCode = await this.askQuestion('\nEnter coupon code to test: ');
      const orderAmount = await this.askQuestion('Enter order amount: ');

      if (couponCode && orderAmount) {
        console.log('\n🎫 Validating coupon...');
        const validationResponse = await axios.post(`${BASE_URL}/coupons/validate`, {
          code: couponCode.toUpperCase(),
          order_amount: parseFloat(orderAmount),
          product_ids: []
        }, {
          headers: { Authorization: `Bearer ${this.customerToken}` }
        });

        if (validationResponse.data.success) {
          const data = validationResponse.data.data;
          console.log('✅ Coupon is valid!');
          console.log(`   Discount: ₹${data.discount_amount}`);
          console.log(`   Final Amount: ₹${data.final_amount}`);
        }
      }

    } catch (error) {
      console.error('❌ Customer workflow error:', error.response?.data?.message || error.message);
    }

    await this.showMainMenu();
  }

  async testCompleteWorkflow() {
    console.log('\n🔄 Testing Complete Workflow...\n');
    console.log('This will test the entire coupon lifecycle from creation to validation.\n');

    try {
      // Use default test credentials
      console.log('🔐 Logging in as vendor...');
      const vendorLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'vendor@test.com',
        password: 'password123'
      });
      this.vendorToken = vendorLogin.data.data.token;
      console.log('✅ Vendor login successful');

      console.log('🔐 Logging in as customer...');
      const customerLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'customer@test.com',
        password: 'password123'
      });
      this.customerToken = customerLogin.data.data.token;
      console.log('✅ Customer login successful');

      // Create a test coupon
      console.log('\n🎫 Creating test coupon...');
      const testCouponCode = `TEST${Date.now()}`;
      const collections = await axios.get(`${BASE_URL}/coupons/collections`, {
        headers: { Authorization: `Bearer ${this.vendorToken}` }
      });

      const couponResponse = await axios.post(`${BASE_URL}/coupons`, {
        code: testCouponCode,
        product_type: 'collection',
        collection_id: collections.data.data[0]?.id || 1,
        coupon_type: 'discount',
        discount_value: 15,
        expiration_date: '2025-12-31',
        usage_limit: 10,
        minimum_order_amount: 500
      }, {
        headers: { Authorization: `Bearer ${this.vendorToken}` }
      });

      console.log(`✅ Test coupon created: ${testCouponCode}`);

      // Validate the coupon
      console.log('\n✅ Validating the coupon...');
      const validation = await axios.post(`${BASE_URL}/coupons/validate`, {
        code: testCouponCode,
        order_amount: 1000,
        product_ids: []
      }, {
        headers: { Authorization: `Bearer ${this.customerToken}` }
      });

      console.log('✅ Coupon validation successful!');
      console.log(`   Discount: ₹${validation.data.data.discount_amount}`);
      console.log(`   Final Amount: ₹${validation.data.data.final_amount}`);

      // Get coupon analytics
      console.log('\n📊 Fetching analytics...');
      const analytics = await axios.get(`${BASE_URL}/coupons/vendor/analytics`, {
        headers: { Authorization: `Bearer ${this.vendorToken}` }
      });

      console.log('✅ Analytics retrieved successfully');
      console.log(`   Total coupons used: ${analytics.data.data.overall_stats.total_uses || 0}`);

      console.log('\n🎉 Complete workflow test successful!');

    } catch (error) {
      console.error('❌ Complete workflow error:', error.response?.data?.message || error.message);
    }

    await this.showMainMenu();
  }

  async testAPIEndpoints() {
    console.log('\n🔗 Testing API Endpoints Directly...\n');

    const endpoints = [
      { method: 'GET', url: '/api/health', auth: false, description: 'Health check' },
      { method: 'GET', url: '/api/coupons/collections', auth: true, description: 'Get collections' },
      { method: 'GET', url: '/api/coupons/vendor/products', auth: true, description: 'Get vendor products' },
      { method: 'GET', url: '/api/coupons/vendor/coupons', auth: true, description: 'Get vendor coupons' },
      { method: 'GET', url: '/api/coupons/vendor/analytics', auth: true, description: 'Get analytics' }
    ];

    if (!this.vendorToken) {
      console.log('⚠️ No vendor token available. Please run vendor login first.');
      await this.showMainMenu();
      return;
    }

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint.method} ${endpoint.url}...`);
        
        const config = {
          method: endpoint.method.toLowerCase(),
          url: `${BASE_URL.replace('/api', '')}${endpoint.url}`
        };

        if (endpoint.auth) {
          config.headers = { Authorization: `Bearer ${this.vendorToken}` };
        }

        const response = await axios(config);
        console.log(`✅ ${endpoint.description}: ${response.status} ${response.statusText}`);
        
      } catch (error) {
        console.log(`❌ ${endpoint.description}: ${error.response?.status} ${error.response?.statusText || error.message}`);
      }
    }

    await this.showMainMenu();
  }

  async createTestCoupon(collections, products) {
    console.log('\n🎫 Creating Test Coupon...\n');

    const couponType = await this.askQuestion('Coupon type (1=Collection, 2=Product): ');
    const discountType = await this.askQuestion('Discount type (1=Percentage, 2=Flat amount): ');
    const discountValue = await this.askQuestion('Discount value: ');
    const couponCode = await this.askQuestion('Coupon code (or press Enter for auto-generated): ') || `TEST${Date.now()}`;

    const couponData = {
      code: couponCode.toUpperCase(),
      product_type: couponType === '1' ? 'collection' : 'product',
      coupon_type: discountType === '1' ? 'discount' : 'flat_off',
      discount_value: parseFloat(discountValue),
      expiration_date: '2025-12-31',
      usage_limit: 100
    };

    if (couponType === '1' && collections.length > 0) {
      couponData.collection_id = collections[0].id;
    } else if (couponType === '2' && products.length > 0) {
      couponData.product_id = products[0].id;
    } else {
      console.log('❌ No collections or products available for coupon creation');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/coupons`, couponData, {
        headers: { Authorization: `Bearer ${this.vendorToken}` }
      });

      console.log(`✅ Coupon created successfully: ${response.data.data.code}`);
      console.log(`   Type: ${response.data.data.coupon_type}`);
      console.log(`   Value: ${response.data.data.discount_value}${response.data.data.coupon_type === 'discount' ? '%' : '₹'}`);

    } catch (error) {
      console.error('❌ Coupon creation failed:', error.response?.data?.message || error.message);
    }
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }
}

// Run the manual tester
if (require.main === module) {
  const tester = new ManualCouponTester();
  tester.start().catch(console.error);
}

module.exports = ManualCouponTester;
