const request = require('supertest');
const app = require('../app');
const { Coupon, CouponUsage, User, Product, Category } = require('../models/associations');
const sequelize = require('../config/db');

describe('Coupon Management System', () => {
  let vendorToken, customerToken, adminToken;
  let vendorId, customerId, adminId;
  let testProduct, testCategory;
  let createdCouponId;

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: false });
    
    // Create test users
    await createTestUsers();
    
    // Login users and get tokens
    await loginTestUsers();
    
    // Create test data
    await createTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    await sequelize.close();
  });

  // Helper functions
  async function createTestUsers() {
    try {
      // Create vendor user
      const vendor = await User.create({
        email: 'test-vendor@example.com',
        password: 'password123',
        role: 'vendor'
      });
      vendorId = vendor.id;

      // Create customer user
      const customer = await User.create({
        email: 'test-customer@example.com',
        password: 'password123',
        role: 'user'
      });
      customerId = customer.id;

      // Create admin user
      const admin = await User.create({
        email: 'test-admin@example.com',
        password: 'password123',
        role: 'admin'
      });
      adminId = admin.id;

    } catch (error) {
      console.log('Users might already exist, continuing...');
    }
  }

  async function loginTestUsers() {
    // Login vendor
    const vendorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-vendor@example.com',
        password: 'password123'
      });
    vendorToken = vendorLogin.body.data.token;

    // Login customer
    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-customer@example.com',
        password: 'password123'
      });
    customerToken = customerLogin.body.data.token;

    // Login admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-admin@example.com',
        password: 'password123'
      });
    adminToken = adminLogin.body.data.token;
  }

  async function createTestData() {
    // Create test category
    testCategory = await Category.create({
      name: 'Test Electronics',
      slug: 'test-electronics',
      description: 'Test category for electronics',
      is_active: true,
      sort_order: 1
    });

    // Create test product
    testProduct = await Product.create({
      name: 'Test iPhone',
      price: 50000,
      stock: 100,
      description: 'Test iPhone for coupon testing',
      vendor_id: vendorId,
      subcategory_id: null
    });
  }

  async function cleanupTestData() {
    try {
      await CouponUsage.destroy({ where: {} });
      await Coupon.destroy({ where: {} });
      await Product.destroy({ where: { name: 'Test iPhone' } });
      await Category.destroy({ where: { name: 'Test Electronics' } });
      await User.destroy({ where: { email: { [sequelize.Op.like]: 'test-%@example.com' } } });
    } catch (error) {
      console.log('Cleanup error:', error.message);
    }
  }

  describe('Vendor Coupon Management', () => {
    
    test('Should get vendor products', async () => {
      const response = await request(app)
        .get('/api/coupons/vendor/products')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('Should get collections', async () => {
      const response = await request(app)
        .get('/api/coupons/collections')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('Should create collection-based discount coupon', async () => {
      const couponData = {
        code: 'TEST20COLLECTION',
        product_type: 'collection',
        collection_id: testCategory.id,
        coupon_type: 'discount',
        discount_value: 20,
        expiration_date: '2024-12-31',
        usage_limit: 100,
        minimum_order_amount: 500
      };

      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(couponData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('TEST20COLLECTION');
      expect(response.body.data.vendor_id).toBe(vendorId);
      
      createdCouponId = response.body.data.id;
    });

    test('Should create product-specific flat-off coupon', async () => {
      const couponData = {
        code: 'FLAT100PRODUCT',
        product_type: 'product',
        product_id: testProduct.id,
        coupon_type: 'flat_off',
        discount_value: 100,
        expiration_date: '2024-12-31',
        usage_limit: 50
      };

      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(couponData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('FLAT100PRODUCT');
      expect(response.body.data.coupon_type).toBe('flat_off');
    });

    test('Should not create coupon with duplicate code', async () => {
      const couponData = {
        code: 'TEST20COLLECTION', // Same code as before
        product_type: 'collection',
        collection_id: testCategory.id,
        coupon_type: 'discount',
        discount_value: 15,
        expiration_date: '2024-12-31'
      };

      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(couponData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('Should get vendor coupons', async () => {
      const response = await request(app)
        .get('/api/coupons/vendor/coupons')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.coupons.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('Should get coupon details', async () => {
      const response = await request(app)
        .get(`/api/coupons/${createdCouponId}`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.coupon.id).toBe(createdCouponId);
      expect(response.body.data.stats).toBeDefined();
    });

    test('Should update coupon', async () => {
      const updateData = {
        discount_value: 25,
        usage_limit: 150
      };

      const response = await request(app)
        .put(`/api/coupons/${createdCouponId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.discount_value).toBe('25.00');
      expect(response.body.data.usage_limit).toBe(150);
    });

  });

  describe('Customer Coupon Validation', () => {

    test('Should validate valid collection coupon', async () => {
      const validationData = {
        code: 'TEST20COLLECTION',
        order_amount: 1000,
        product_ids: []
      };

      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.discount_amount).toBe(250); // 25% of 1000
      expect(response.body.data.final_amount).toBe(750);
    });

    test('Should validate valid product coupon', async () => {
      const validationData = {
        code: 'FLAT100PRODUCT',
        order_amount: 1000,
        product_ids: [testProduct.id]
      };

      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.discount_amount).toBe(100); // Flat 100 off
      expect(response.body.data.final_amount).toBe(900);
    });

    test('Should reject invalid coupon code', async () => {
      const validationData = {
        code: 'INVALID_CODE',
        order_amount: 1000,
        product_ids: []
      };

      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validationData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid coupon code');
    });

    test('Should reject coupon below minimum order amount', async () => {
      const validationData = {
        code: 'TEST20COLLECTION',
        order_amount: 300, // Below minimum 500
        product_ids: []
      };

      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validationData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Minimum order amount');
    });

    test('Should reject product coupon for wrong product', async () => {
      const validationData = {
        code: 'FLAT100PRODUCT',
        order_amount: 1000,
        product_ids: [999] // Wrong product ID
      };

      const response = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validationData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('specific products');
    });

  });

  describe('Security Tests', () => {

    test('Should not allow customer to create coupons', async () => {
      const couponData = {
        code: 'CUSTOMER_COUPON',
        product_type: 'collection',
        collection_id: testCategory.id,
        coupon_type: 'discount',
        discount_value: 10,
        expiration_date: '2024-12-31'
      };

      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(couponData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Vendor access required');
    });

    test('Should not allow vendor to access other vendor coupons', async () => {
      // Create another vendor
      const anotherVendor = await User.create({
        email: 'another-vendor@example.com',
        password: 'password123',
        role: 'vendor'
      });

      // Login as another vendor
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'another-vendor@example.com',
          password: 'password123'
        });

      const anotherVendorToken = loginResponse.body.data.token;

      // Try to access first vendor's coupon
      const response = await request(app)
        .get(`/api/coupons/${createdCouponId}`)
        .set('Authorization', `Bearer ${anotherVendorToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);

      // Cleanup
      await User.destroy({ where: { id: anotherVendor.id } });
    });

    test('Should require authentication for all endpoints', async () => {
      const response = await request(app)
        .get('/api/coupons/vendor/coupons');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token is required');
    });

  });

  describe('Analytics and Usage Tracking', () => {

    test('Should get vendor coupon usage', async () => {
      const response = await request(app)
        .get('/api/coupons/vendor/usage')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.usage_history).toBeDefined();
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    test('Should get coupon analytics', async () => {
      const response = await request(app)
        .get('/api/coupons/vendor/analytics?period=30')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period_days).toBe(30);
      expect(response.body.data.coupon_performance).toBeDefined();
      expect(response.body.data.overall_stats).toBeDefined();
    });

  });

  describe('Edge Cases and Error Handling', () => {

    test('Should handle missing required fields', async () => {
      const invalidCouponData = {
        code: 'INCOMPLETE',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(invalidCouponData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });

    test('Should handle invalid discount values', async () => {
      const invalidCouponData = {
        code: 'INVALID_DISCOUNT',
        product_type: 'collection',
        collection_id: testCategory.id,
        coupon_type: 'discount',
        discount_value: 150, // Invalid percentage > 100
        expiration_date: '2024-12-31'
      };

      const response = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send(invalidCouponData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Should handle non-existent coupon deletion', async () => {
      const response = await request(app)
        .delete('/api/coupons/99999')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Coupon not found');
    });

  });

});
