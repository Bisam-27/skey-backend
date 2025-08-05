const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server is working!' });
});

// Test orders endpoint (simplified)
app.get('/api/user/orders', (req, res) => {
  // Mock response for testing
  res.json({
    success: true,
    data: {
      orders: [
        {
          id: 1,
          order_number: 'ORD-123',
          customer_name: 'Test User',
          total_amount: 1699,
          created_at: new Date(),
          items: [
            {
              id: 1,
              product_name: 'Test Product',
              product_image: 'img/prod-1.jpg',
              quantity: 2,
              line_total: 1699,
              size: 'L',
              color: 'Blue'
            }
          ]
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalOrders: 1,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  });
});

// Start server
app.listen(5000, () => {
  console.log('🎉 Simple test server running on http://localhost:5000');
  console.log('📋 Test endpoints:');
  console.log('  GET /api/test - Test endpoint');
  console.log('  GET /api/user/orders - Mock orders endpoint');
});

// Keep the process running
setInterval(() => {}, 1000);
