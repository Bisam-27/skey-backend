# Frontend Coupon Integration Guide

## Overview
This guide shows how to integrate the coupon system with your frontend application.

## JavaScript API Client Example

### 1. Coupon API Client Class

```javascript
class CouponAPI {
  constructor(baseURL = 'http://localhost:5000/api', token = null) {
    this.baseURL = baseURL;
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Vendor Methods
  async createCoupon(couponData) {
    return this.request('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData)
    });
  }

  async getVendorCoupons(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/coupons/vendor/coupons?${queryString}`);
  }

  async getVendorProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/coupons/vendor/products?${queryString}`);
  }

  async getCollections() {
    return this.request('/coupons/collections');
  }

  async getCouponDetails(couponId) {
    return this.request(`/coupons/${couponId}`);
  }

  async updateCoupon(couponId, updateData) {
    return this.request(`/coupons/${couponId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  async deleteCoupon(couponId) {
    return this.request(`/coupons/${couponId}`, {
      method: 'DELETE'
    });
  }

  // Customer Methods
  async validateCoupon(code, orderAmount, productIds = []) {
    return this.request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({
        code,
        order_amount: orderAmount,
        product_ids: productIds
      })
    });
  }

  // Analytics Methods
  async getCouponUsage(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/coupons/vendor/usage?${queryString}`);
  }

  async getCouponAnalytics(period = 30) {
    return this.request(`/coupons/vendor/analytics?period=${period}`);
  }
}
```

### 2. Vendor Coupon Creation Form

```html
<!-- Coupon Creation Form -->
<form id="couponForm">
  <div class="form-group">
    <label for="couponCode">Coupon Code</label>
    <input type="text" id="couponCode" name="code" required 
           placeholder="e.g., SAVE20" maxlength="50">
  </div>

  <div class="form-group">
    <label for="productType">Product Type</label>
    <select id="productType" name="product_type" required>
      <option value="">Select Type</option>
      <option value="collection">Collection / Category</option>
      <option value="product">Specific Product</option>
    </select>
  </div>

  <div class="form-group" id="collectionGroup" style="display: none;">
    <label for="collection">Collection</label>
    <select id="collection" name="collection_id">
      <option value="">Select Collection</option>
    </select>
  </div>

  <div class="form-group" id="productGroup" style="display: none;">
    <label for="product">Product</label>
    <select id="product" name="product_id">
      <option value="">Select Product</option>
    </select>
  </div>

  <div class="form-group">
    <label for="couponType">Coupon Type</label>
    <select id="couponType" name="coupon_type" required>
      <option value="">Select Type</option>
      <option value="discount">Percentage Discount</option>
      <option value="flat_off">Flat Amount Off</option>
    </select>
  </div>

  <div class="form-group">
    <label for="discountValue">Discount Value</label>
    <input type="number" id="discountValue" name="discount_value" 
           step="0.01" min="0" required>
    <small id="discountHelp">Enter percentage (0-100) or flat amount</small>
  </div>

  <div class="form-group">
    <label for="expirationDate">Expiration Date</label>
    <input type="date" id="expirationDate" name="expiration_date" required>
  </div>

  <div class="form-group">
    <label for="usageLimit">Usage Limit (Optional)</label>
    <input type="number" id="usageLimit" name="usage_limit" min="1">
  </div>

  <div class="form-group">
    <label for="minimumAmount">Minimum Order Amount (Optional)</label>
    <input type="number" id="minimumAmount" name="minimum_order_amount" 
           step="0.01" min="0">
  </div>

  <button type="submit">Create Coupon</button>
</form>
```

### 3. JavaScript Form Handler

```javascript
// Initialize API client
const couponAPI = new CouponAPI();

// Set token after vendor login
function setVendorToken(token) {
  couponAPI.setToken(token);
}

// Load form data
async function loadFormData() {
  try {
    // Load collections
    const collectionsResponse = await couponAPI.getCollections();
    const collectionSelect = document.getElementById('collection');
    
    collectionsResponse.data.forEach(collection => {
      const option = document.createElement('option');
      option.value = collection.id;
      option.textContent = collection.name;
      collectionSelect.appendChild(option);
    });

    // Load vendor products
    const productsResponse = await couponAPI.getVendorProducts();
    const productSelect = document.getElementById('product');
    
    productsResponse.data.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = `${product.name} - ₹${product.price}`;
      productSelect.appendChild(option);
    });

  } catch (error) {
    console.error('Error loading form data:', error);
    alert('Error loading form data: ' + error.message);
  }
}

// Handle product type change
document.getElementById('productType').addEventListener('change', function() {
  const productType = this.value;
  const collectionGroup = document.getElementById('collectionGroup');
  const productGroup = document.getElementById('productGroup');

  if (productType === 'collection') {
    collectionGroup.style.display = 'block';
    productGroup.style.display = 'none';
    document.getElementById('product').value = '';
  } else if (productType === 'product') {
    collectionGroup.style.display = 'none';
    productGroup.style.display = 'block';
    document.getElementById('collection').value = '';
  } else {
    collectionGroup.style.display = 'none';
    productGroup.style.display = 'none';
  }
});

// Handle coupon type change
document.getElementById('couponType').addEventListener('change', function() {
  const couponType = this.value;
  const discountHelp = document.getElementById('discountHelp');
  const discountInput = document.getElementById('discountValue');

  if (couponType === 'discount') {
    discountHelp.textContent = 'Enter percentage (0-100)';
    discountInput.max = '100';
  } else if (couponType === 'flat_off') {
    discountHelp.textContent = 'Enter flat amount in ₹';
    discountInput.removeAttribute('max');
  }
});

// Handle form submission
document.getElementById('couponForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = new FormData(this);
  const couponData = Object.fromEntries(formData.entries());

  // Convert numeric fields
  couponData.discount_value = parseFloat(couponData.discount_value);
  if (couponData.usage_limit) {
    couponData.usage_limit = parseInt(couponData.usage_limit);
  }
  if (couponData.minimum_order_amount) {
    couponData.minimum_order_amount = parseFloat(couponData.minimum_order_amount);
  }

  // Convert IDs to integers
  if (couponData.collection_id) {
    couponData.collection_id = parseInt(couponData.collection_id);
  }
  if (couponData.product_id) {
    couponData.product_id = parseInt(couponData.product_id);
  }

  try {
    const response = await couponAPI.createCoupon(couponData);
    alert('Coupon created successfully!');
    this.reset();
    // Optionally redirect or refresh coupon list
  } catch (error) {
    console.error('Error creating coupon:', error);
    alert('Error creating coupon: ' + error.message);
  }
});

// Load form data when page loads
document.addEventListener('DOMContentLoaded', loadFormData);
```

### 4. Customer Coupon Validation

```javascript
// Customer coupon validation
async function validateCouponCode() {
  const couponCode = document.getElementById('couponCode').value;
  const orderAmount = calculateOrderTotal(); // Your function to calculate total
  const productIds = getCartProductIds(); // Your function to get product IDs

  if (!couponCode) {
    return;
  }

  try {
    const response = await couponAPI.validateCoupon(couponCode, orderAmount, productIds);
    
    // Show success message
    document.getElementById('couponMessage').innerHTML = 
      `<div class="success">Coupon applied! You save ₹${response.data.discount_amount}</div>`;
    
    // Update order summary
    document.getElementById('discount').textContent = `₹${response.data.discount_amount}`;
    document.getElementById('finalTotal').textContent = `₹${response.data.final_amount}`;
    
    // Store coupon data for checkout
    window.appliedCoupon = response.data;

  } catch (error) {
    document.getElementById('couponMessage').innerHTML = 
      `<div class="error">${error.message}</div>`;
    
    // Reset discount
    document.getElementById('discount').textContent = '₹0';
    document.getElementById('finalTotal').textContent = `₹${orderAmount}`;
    window.appliedCoupon = null;
  }
}

// Add event listener for coupon input
document.getElementById('applyCoupon').addEventListener('click', validateCouponCode);
```

### 5. CSS Styles

```css
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group small {
  color: #666;
  font-size: 0.875rem;
}

.success {
  color: #28a745;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0.5rem 0;
}
```

## Usage Examples

### Creating a Coupon
```javascript
const newCoupon = {
  code: 'SAVE20',
  product_type: 'collection',
  collection_id: 1,
  coupon_type: 'discount',
  discount_value: 20,
  expiration_date: '2024-12-31',
  usage_limit: 100,
  minimum_order_amount: 500
};

couponAPI.createCoupon(newCoupon)
  .then(response => console.log('Coupon created:', response.data))
  .catch(error => console.error('Error:', error.message));
```

### Validating a Coupon
```javascript
couponAPI.validateCoupon('SAVE20', 1000, [1, 2, 3])
  .then(response => {
    console.log('Discount amount:', response.data.discount_amount);
    console.log('Final amount:', response.data.final_amount);
  })
  .catch(error => console.error('Coupon invalid:', error.message));
```

This integration guide provides a complete frontend implementation for the coupon system!
