const axios = require('axios');
const { Coupon, CouponUsage, User, Product, Category } = require('../models/associations');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_CONFIG = {
  vendor: {
    email: 'test-vendor-integration@example.com',
    password: 'testpass123',
    role: 'vendor'
  },
  customer: {
    email: 'test-customer-integration@example.com',
    password: 'testpass123',
    role: 'user'
  }
};

class CouponIntegrationTest {
  constructor() {
    this.vendorToken = null;
    this.customerToken = null;
    this.testData = {
      vendorId: null,
      customerId: null,
      productId: null,
      categoryId: null,
      couponIds: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Coupon Integration Tests...\n');
    
    try {
      await this.setupTestData();
      await this.testVendorAuthentication();
      await this.testCustomerAuthentication();
      await this.testCouponCreation();
      await this.testCouponValidation();
      await this.testCouponManagement();
      await this.testSecurityFeatures();
      await this.testAnalytics();
      await this.testErrorHandling();
      
      console.log('\n🎉 All integration tests passed successfully!');
      await this.cleanup();
      
    } catch (error) {
      console.error('\n❌ Integration test failed:', error.message);
      if (error.response?.data) {
        console.error('Error details:', JSON.stringify(error.response.data, null, 2));
      }
      await this.cleanup();
      throw error;
    }
  }

  async setupTestData() {
    console.log('📋 Setting up test data...');
    
    try {
      // Create test category
      const category = await Category.create({
        name: 'Integration Test Category',
        slug: 'integration-test-category',
        description: 'Test category for integration testing',
        is_active: true,
        sort_order: 1
      });
      this.testData.categoryId = category.id;

      // Create test users
      const vendor = await User.create({
        email: TEST_CONFIG.vendor.email,
        password: TEST_CONFIG.vendor.password,
        role: TEST_CONFIG.vendor.role
      });
      this.testData.vendorId = vendor.id;

      const customer = await User.create({
        email: TEST_CONFIG.customer.email,
        password: TEST_CONFIG.customer.password,
        role: TEST_CONFIG.customer.role
      });
      this.testData.customerId = customer.id;

      // Create test product
      const product = await Product.create({
        name: 'Integration Test Product',
        price: 25000,
        stock: 50,
        description: 'Test product for integration testing',
        vendor_id: this.testData.vendorId
      });
      this.testData.productId = product.id;

      console.log('✅ Test data setup completed');
      
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log('ℹ️ Test data already exists, continuing...');
        // Get existing data
        const vendor = await User.findOne({ where: { email: TEST_CONFIG.vendor.email } });
        const customer = await User.findOne({ where: { email: TEST_CONFIG.customer.email } });
        const category = await Category.findOne({ where: { name: 'Integration Test Category' } });
        const product = await Product.findOne({ where: { name: 'Integration Test Product' } });
        
        this.testData.vendorId = vendor?.id;
        this.testData.customerId = customer?.id;
        this.testData.categoryId = category?.id;
        this.testData.productId = product?.id;
      } else {
        throw error;
      }
    }
  }

  async testVendorAuthentication() {
    console.log('🔐 Testing vendor authentication...');
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_CONFIG.vendor.email,
      password: TEST_CONFIG.vendor.password
    });

    if (response.data.success && response.data.data.token) {
      this.vendorToken = response.data.data.token;
      console.log('✅ Vendor authentication successful');
    } else {
      throw new Error('Vendor authentication failed');
    }
  }

  async testCustomerAuthentication() {
    console.log('🔐 Testing customer authentication...');
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_CONFIG.customer.email,
      password: TEST_CONFIG.customer.password
    });

    if (response.data.success && response.data.data.token) {
      this.customerToken = response.data.data.token;
      console.log('✅ Customer authentication successful');
    } else {
      throw new Error('Customer authentication failed');
    }
  }

  async testCouponCreation() {
    console.log('🎫 Testing coupon creation...');

    // Test 1: Create collection-based discount coupon
    const collectionCoupon = {
      code: 'INTEGRATION20',
      product_type: 'collection',
      collection_id: this.testData.categoryId,
      coupon_type: 'discount',
      discount_value: 20,
      expiration_date: '2025-12-31',
      usage_limit: 100,
      minimum_order_amount: 1000
    };

    const response1 = await axios.post(`${BASE_URL}/coupons`, collectionCoupon, {
      headers: { Authorization: `Bearer ${this.vendorToken}` }
    });

    if (response1.data.success) {
      this.testData.couponIds.push(response1.data.data.id);
      console.log('✅ Collection coupon created successfully');
    } else {
      throw new Error('Collection coupon creation failed');
    }

    // Test 2: Create product-specific flat-off coupon
    const productCoupon = {
      code: 'FLAT500',
      product_type: 'product',
      product_id: this.testData.productId,
      coupon_type: 'flat_off',
      discount_value: 500,
      expiration_date: '2025-12-31',
      usage_limit: 50
    };

    const response2 = await axios.post(`${BASE_URL}/coupons`, productCoupon, {
      headers: { Authorization: `Bearer ${this.vendorToken}` }
    });

    if (response2.data.success) {
      this.testData.couponIds.push(response2.data.data.id);
      console.log('✅ Product coupon created successfully');
    } else {
      throw new Error('Product coupon creation failed');
    }
  }

  async testCouponValidation() {
    console.log('✅ Testing coupon validation...');

    // Test 1: Validate collection coupon
    const validation1 = await axios.post(`${BASE_URL}/coupons/validate`, {
      code: 'INTEGRATION20',
      order_amount: 2000,
      product_ids: []
    }, {
      headers: { Authorization: `Bearer ${this.customerToken}` }
    });

    if (validation1.data.success && validation1.data.data.discount_amount === 400) {
      console.log('✅ Collection coupon validation successful');
    } else {
      throw new Error('Collection coupon validation failed');
    }

    // Test 2: Validate product coupon
    const validation2 = await axios.post(`${BASE_URL}/coupons/validate`, {
      code: 'FLAT500',
      order_amount: 2000,
      product_ids: [this.testData.productId]
    }, {
      headers: { Authorization: `Bearer ${this.customerToken}` }
    });

    if (validation2.data.success && validation2.data.data.discount_amount === 500) {
      console.log('✅ Product coupon validation successful');
    } else {
      throw new Error('Product coupon validation failed');
    }
  }

  async testCouponManagement() {
    console.log('📊 Testing coupon management...');

    // Test 1: Get vendor coupons
    const couponsResponse = await axios.get(`${BASE_URL}/coupons/vendor/coupons`, {
      headers: { Authorization: `Bearer ${this.vendorToken}` }
    });

    if (couponsResponse.data.success && couponsResponse.data.data.coupons.length >= 2) {
      console.log('✅ Vendor coupons retrieval successful');
    } else {
      throw new Error('Vendor coupons retrieval failed');
    }

    // Test 2: Get coupon details
    const detailsResponse = await axios.get(`${BASE_URL}/coupons/${this.testData.couponIds[0]}`, {
      headers: { Authorization: `Bearer ${this.vendorToken}` }
    });

    if (detailsResponse.data.success && detailsResponse.data.data.coupon) {
      console.log('✅ Coupon details retrieval successful');
    } else {
      throw new Error('Coupon details retrieval failed');
    }

    // Test 3: Update coupon
    const updateResponse = await axios.put(`${BASE_URL}/coupons/${this.testData.couponIds[0]}`, {
      discount_value: 25,
      usage_limit: 150
    }, {
      headers: { Authorization: `Bearer ${this.vendorToken}` }
    });

    if (updateResponse.data.success) {
      console.log('✅ Coupon update successful');
    } else {
      throw new Error('Coupon update failed');
    }
  }

  async testSecurityFeatures() {
    console.log('🔒 Testing security features...');

    // Test 1: Customer cannot create coupons
    try {
      await axios.post(`${BASE_URL}/coupons`, {
        code: 'UNAUTHORIZED',
        product_type: 'collection',
        collection_id: this.testData.categoryId,
        coupon_type: 'discount',
        discount_value: 10,
        expiration_date: '2025-12-31'
      }, {
        headers: { Authorization: `Bearer ${this.customerToken}` }
      });
      throw new Error('Security test failed - customer was able to create coupon');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Security test passed - customer cannot create coupons');
      } else {
        throw error;
      }
    }

    // Test 2: Unauthenticated access denied
    try {
      await axios.get(`${BASE_URL}/coupons/vendor/coupons`);
      throw new Error('Security test failed - unauthenticated access allowed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Security test passed - unauthenticated access denied');
      } else {
        throw error;
      }
    }
  }

  async testAnalytics() {
    console.log('📈 Testing analytics features...');

    // Test 1: Get usage analytics
    const analyticsResponse = await axios.get(`${BASE_URL}/coupons/vendor/analytics?period=30`, {
      headers: { Authorization: `Bearer ${this.vendorToken}` }
    });

    if (analyticsResponse.data.success && analyticsResponse.data.data.overall_stats) {
      console.log('✅ Analytics retrieval successful');
    } else {
      throw new Error('Analytics retrieval failed');
    }

    // Test 2: Get usage history
    const usageResponse = await axios.get(`${BASE_URL}/coupons/vendor/usage`, {
      headers: { Authorization: `Bearer ${this.vendorToken}` }
    });

    if (usageResponse.data.success && usageResponse.data.data.usage_history) {
      console.log('✅ Usage history retrieval successful');
    } else {
      throw new Error('Usage history retrieval failed');
    }
  }

  async testErrorHandling() {
    console.log('⚠️ Testing error handling...');

    // Test 1: Invalid coupon code
    try {
      await axios.post(`${BASE_URL}/coupons/validate`, {
        code: 'NONEXISTENT',
        order_amount: 1000,
        product_ids: []
      }, {
        headers: { Authorization: `Bearer ${this.customerToken}` }
      });
      throw new Error('Error handling test failed - invalid coupon accepted');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Error handling test passed - invalid coupon rejected');
      } else {
        throw error;
      }
    }

    // Test 2: Minimum order amount validation
    try {
      await axios.post(`${BASE_URL}/coupons/validate`, {
        code: 'INTEGRATION20',
        order_amount: 500, // Below minimum 1000
        product_ids: []
      }, {
        headers: { Authorization: `Bearer ${this.customerToken}` }
      });
      throw new Error('Error handling test failed - minimum order validation bypassed');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Error handling test passed - minimum order validation working');
      } else {
        throw error;
      }
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Delete test coupons
      if (this.testData.couponIds.length > 0) {
        await Coupon.destroy({
          where: { id: this.testData.couponIds }
        });
      }

      // Delete test product
      if (this.testData.productId) {
        await Product.destroy({
          where: { id: this.testData.productId }
        });
      }

      // Delete test users
      await User.destroy({
        where: {
          email: [TEST_CONFIG.vendor.email, TEST_CONFIG.customer.email]
        }
      });

      // Delete test category
      if (this.testData.categoryId) {
        await Category.destroy({
          where: { id: this.testData.categoryId }
        });
      }

      console.log('✅ Cleanup completed');
      
    } catch (error) {
      console.log('⚠️ Cleanup warning:', error.message);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new CouponIntegrationTest();
  
  tester.runAllTests()
    .then(() => {
      console.log('\n🎊 Integration testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Integration testing failed:', error.message);
      process.exit(1);
    });
}

module.exports = CouponIntegrationTest;
