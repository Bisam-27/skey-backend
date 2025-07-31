#!/usr/bin/env node

/**
 * Test Runner for Coupon System
 * 
 * This script runs all coupon system tests and provides a summary report.
 */

const { spawn } = require('child_process');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Coupon System Test Suite\n');
    console.log('=' .repeat(50));

    try {
      // Test 1: Database Setup
      await this.runTest('Database Setup', 'node scripts/createCouponTables.js');
      
      // Test 2: Integration Tests
      await this.runTest('Integration Tests', 'node test/couponIntegration.test.js');
      
      // Test 3: API Endpoint Tests
      await this.runTest('API Health Check', 'curl -s http://localhost:5000/api/health || echo "Server not running"');

      this.printSummary();

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async runTest(testName, command) {
    console.log(`\n🔄 Running: ${testName}`);
    console.log('-'.repeat(30));

    try {
      const result = await this.executeCommand(command);
      
      if (result.success) {
        console.log(`✅ ${testName}: PASSED`);
        this.results.passed++;
      } else {
        console.log(`❌ ${testName}: FAILED`);
        console.log('Error output:', result.error);
        this.results.failed++;
      }
      
      this.results.total++;
      
    } catch (error) {
      console.log(`❌ ${testName}: ERROR - ${error.message}`);
      this.results.failed++;
      this.results.total++;
    }
  }

  executeCommand(command) {
    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, { 
        cwd: path.join(__dirname, '..'),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        resolve({
          success: code === 0,
          stdout,
          stderr,
          error: stderr || (code !== 0 ? `Process exited with code ${code}` : null)
        });
      });

      process.on('error', (error) => {
        resolve({
          success: false,
          stdout: '',
          stderr: error.message,
          error: error.message
        });
      });
    });
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    
    const successRate = this.results.total > 0 ? 
      ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
    
    console.log(`📈 Success Rate: ${successRate}%`);

    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed! Coupon system is ready to use.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the errors above.');
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Start your server: npm start');
    console.log('2. Run manual tests: npm run test:manual');
    console.log('3. Test API endpoints with Postman or curl');
    console.log('4. Integrate with your frontend application');
  }
}

// Quick test functions
class QuickTests {
  static async checkServerHealth() {
    console.log('🏥 Checking server health...');
    
    try {
      const axios = require('axios');
      const response = await axios.get('http://localhost:5000/api/health', {
        timeout: 5000
      });
      
      if (response.data.success) {
        console.log('✅ Server is healthy and responding');
        return true;
      } else {
        console.log('❌ Server responded but health check failed');
        return false;
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('⚠️ Server is not running. Please start it with: npm start');
      } else {
        console.log('❌ Health check failed:', error.message);
      }
      return false;
    }
  }

  static async testDatabaseConnection() {
    console.log('🗄️ Testing database connection...');
    
    try {
      const sequelize = require('../config/db');
      await sequelize.authenticate();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      return false;
    }
  }

  static async checkCouponTables() {
    console.log('📋 Checking coupon tables...');
    
    try {
      const { Coupon, CouponUsage } = require('../models/associations');
      
      // Try to query the tables
      await Coupon.findAll({ limit: 1 });
      await CouponUsage.findAll({ limit: 1 });
      
      console.log('✅ Coupon tables exist and are accessible');
      return true;
    } catch (error) {
      console.log('❌ Coupon tables check failed:', error.message);
      console.log('💡 Try running: npm run setup:coupons');
      return false;
    }
  }

  static async runQuickChecks() {
    console.log('⚡ Running Quick System Checks\n');
    
    const checks = [
      { name: 'Database Connection', test: this.testDatabaseConnection },
      { name: 'Coupon Tables', test: this.checkCouponTables },
      { name: 'Server Health', test: this.checkServerHealth }
    ];

    let passed = 0;
    
    for (const check of checks) {
      const result = await check.test();
      if (result) passed++;
    }

    console.log(`\n📊 Quick Checks: ${passed}/${checks.length} passed`);
    
    if (passed === checks.length) {
      console.log('🎉 System is ready for coupon functionality!');
    } else {
      console.log('⚠️ Some checks failed. Please address the issues above.');
    }

    return passed === checks.length;
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'all':
      const runner = new TestRunner();
      await runner.runAllTests();
      break;
      
    case 'quick':
      await QuickTests.runQuickChecks();
      break;
      
    case 'health':
      await QuickTests.checkServerHealth();
      break;
      
    case 'db':
      await QuickTests.testDatabaseConnection();
      break;
      
    case 'tables':
      await QuickTests.checkCouponTables();
      break;
      
    case 'help':
    default:
      console.log('🧪 Coupon System Test Runner\n');
      console.log('Usage: node test/runTests.js [command]\n');
      console.log('Commands:');
      console.log('  all     - Run all tests');
      console.log('  quick   - Run quick system checks');
      console.log('  health  - Check server health');
      console.log('  db      - Test database connection');
      console.log('  tables  - Check coupon tables');
      console.log('  help    - Show this help message\n');
      console.log('Examples:');
      console.log('  node test/runTests.js quick');
      console.log('  node test/runTests.js all');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TestRunner, QuickTests };
