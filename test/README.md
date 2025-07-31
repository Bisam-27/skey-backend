# Coupon System Testing Guide

This directory contains comprehensive tests for the coupon management system. Follow this guide to test all functionality and ensure everything works correctly.

## 🚀 Quick Start

### 1. Setup Database Tables
```bash
npm run setup:coupons
```

### 2. Run Quick System Check
```bash
node test/runTests.js quick
```

### 3. Run Integration Tests
```bash
npm run test:coupon
```

### 4. Run Interactive Manual Tests
```bash
npm run test:manual
```

## 📁 Test Files Overview

### `couponSystem.test.js`
- **Purpose**: Comprehensive unit and integration tests using Jest-like structure
- **Coverage**: All API endpoints, security, validation, error handling
- **Usage**: `node test/couponSystem.test.js` (requires test framework)

### `couponIntegration.test.js`
- **Purpose**: End-to-end integration testing without external dependencies
- **Coverage**: Complete workflow from coupon creation to validation
- **Usage**: `npm run test:coupon`

### `manualCouponTest.js`
- **Purpose**: Interactive testing tool for manual verification
- **Coverage**: Step-by-step testing with user prompts
- **Usage**: `npm run test:manual`

### `runTests.js`
- **Purpose**: Test runner and system health checker
- **Coverage**: Database, server health, quick checks
- **Usage**: `node test/runTests.js [command]`

## 🧪 Testing Scenarios

### Scenario 1: Vendor Coupon Creation
```bash
# Test vendor login and coupon creation
npm run test:manual
# Select option 1: Test Vendor Login & Coupon Creation
```

**What it tests:**
- ✅ Vendor authentication
- ✅ Product/collection retrieval
- ✅ Coupon creation (both types)
- ✅ Input validation
- ✅ Database storage

### Scenario 2: Customer Coupon Validation
```bash
# Test customer login and coupon validation
npm run test:manual
# Select option 2: Test Customer Login & Coupon Validation
```

**What it tests:**
- ✅ Customer authentication
- ✅ Coupon code validation
- ✅ Discount calculation
- ✅ Business rule enforcement
- ✅ Error handling

### Scenario 3: Complete Workflow
```bash
# Test end-to-end workflow
npm run test:manual
# Select option 3: Test Complete Workflow
```

**What it tests:**
- ✅ Coupon creation by vendor
- ✅ Coupon validation by customer
- ✅ Usage tracking
- ✅ Analytics generation
- ✅ Data consistency

### Scenario 4: Security Testing
```bash
# Run integration tests for security
npm run test:coupon
```

**What it tests:**
- ✅ Authentication requirements
- ✅ Authorization (vendor-only operations)
- ✅ Data isolation (vendor can only see own coupons)
- ✅ Input sanitization
- ✅ SQL injection prevention

## 🔧 Test Configuration

### Default Test Users
The tests use these default credentials:

**Vendor Account:**
- Email: `test-vendor@example.com`
- Password: `password123`
- Role: `vendor`

**Customer Account:**
- Email: `test-customer@example.com`
- Password: `password123`
- Role: `user`

### Test Data
Tests automatically create and clean up:
- Test categories/collections
- Test products
- Test coupons
- Test users
- Usage records

## 📊 Test Coverage

### API Endpoints Tested
- ✅ `POST /api/coupons` - Create coupon
- ✅ `GET /api/coupons/vendor/coupons` - Get vendor coupons
- ✅ `GET /api/coupons/vendor/products` - Get vendor products
- ✅ `GET /api/coupons/collections` - Get collections
- ✅ `GET /api/coupons/:id` - Get coupon details
- ✅ `PUT /api/coupons/:id` - Update coupon
- ✅ `DELETE /api/coupons/:id` - Delete coupon
- ✅ `POST /api/coupons/validate` - Validate coupon
- ✅ `GET /api/coupons/vendor/usage` - Get usage history
- ✅ `GET /api/coupons/vendor/analytics` - Get analytics

### Business Logic Tested
- ✅ Coupon type validation (discount vs flat_off)
- ✅ Product type validation (collection vs product)
- ✅ Expiration date checking
- ✅ Usage limit enforcement
- ✅ Minimum order amount validation
- ✅ Discount calculation accuracy
- ✅ Vendor isolation
- ✅ Error handling and messages

### Edge Cases Tested
- ✅ Invalid coupon codes
- ✅ Expired coupons
- ✅ Usage limit exceeded
- ✅ Below minimum order amount
- ✅ Wrong product for product-specific coupons
- ✅ Unauthorized access attempts
- ✅ Missing required fields
- ✅ Invalid data types
- ✅ Database connection issues

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:**
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify database exists

#### 2. Server Not Running
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```
**Solution:**
```bash
npm start
# Then run tests in another terminal
```

#### 3. Tables Don't Exist
```
Error: Table 'coupons' doesn't exist
```
**Solution:**
```bash
npm run setup:coupons
```

#### 4. Authentication Errors
```
Error: Access token is required
```
**Solution:**
- Ensure test users exist
- Check if login endpoints are working
- Verify JWT secret is configured

### Debug Mode
Run tests with debug information:
```bash
DEBUG=true npm run test:coupon
```

## 📈 Performance Testing

### Load Testing Coupon Validation
```bash
# Test coupon validation under load
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/coupons/validate \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"code":"TEST20","order_amount":1000}' &
done
wait
```

### Database Performance
```bash
# Check coupon query performance
node -e "
const { Coupon } = require('./models/associations');
console.time('coupon-query');
Coupon.findAll({ limit: 1000 }).then(() => {
  console.timeEnd('coupon-query');
  process.exit(0);
});
"
```

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Coupon System Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: testdb
        options: --health-cmd="mysqladmin ping" --health-interval=10s
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run setup:coupons
      - run: npm run test:coupon
```

## 📝 Test Reports

### Generate Test Report
```bash
# Run all tests and generate report
node test/runTests.js all > test-report.txt 2>&1
```

### View Test Coverage
```bash
# Check which endpoints are covered
grep -r "✅" test/ | wc -l
echo "Total test assertions"
```

## 🎯 Best Practices

### Before Running Tests
1. ✅ Start the server (`npm start`)
2. ✅ Ensure database is running
3. ✅ Run database setup (`npm run setup:coupons`)
4. ✅ Check environment variables

### During Testing
1. ✅ Run tests in isolation
2. ✅ Check for data cleanup
3. ✅ Monitor server logs
4. ✅ Verify database state

### After Testing
1. ✅ Review test results
2. ✅ Check for memory leaks
3. ✅ Clean up test data
4. ✅ Document any issues

## 🚀 Next Steps

After successful testing:

1. **Deploy to staging environment**
2. **Run tests against staging**
3. **Performance testing with real data**
4. **Security audit**
5. **Production deployment**

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs for errors
3. Verify database connectivity
4. Check API documentation in `../docs/`
5. Run quick system check: `node test/runTests.js quick`

---

**Happy Testing! 🧪✨**
