# Coupon Management API Documentation

## Overview
This API provides comprehensive coupon management functionality for vendors to create, manage, and track coupon usage in the e-commerce system.

## Authentication
All vendor endpoints require authentication using JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Base URL
```
http://localhost:5000/api/coupons
```

## Vendor Endpoints

### 1. Create Coupon
**POST** `/api/coupons`

Create a new coupon for vendor's products or collections.

**Headers:**
```
Authorization: Bearer <vendor_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "SAVE20",
  "product_type": "collection", // or "product"
  "collection_id": 1, // required if product_type is "collection"
  "product_id": null, // required if product_type is "product"
  "coupon_type": "discount", // or "flat_off"
  "discount_value": 20.00,
  "expiration_date": "2024-12-31",
  "usage_limit": 100, // optional
  "minimum_order_amount": 500.00 // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "id": 1,
    "code": "SAVE20",
    "vendor_id": 2,
    "product_type": "collection",
    "collection_id": 1,
    "product_id": null,
    "coupon_type": "discount",
    "discount_value": "20.00",
    "expiration_date": "2024-12-31T00:00:00.000Z",
    "is_active": true,
    "usage_limit": 100,
    "used_count": 0,
    "minimum_order_amount": "500.00",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "product": null,
    "collection": {
      "id": 1,
      "name": "Electronics"
    }
  }
}
```

### 2. Get Vendor Coupons
**GET** `/api/coupons/vendor/coupons`

Get all coupons created by the authenticated vendor.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status ("active", "inactive")
- `search` (optional): Search by coupon code

**Example:**
```
GET /api/coupons/vendor/coupons?page=1&limit=10&status=active&search=SAVE
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "id": 1,
        "code": "SAVE20",
        "vendor_id": 2,
        "product_type": "collection",
        "coupon_type": "discount",
        "discount_value": "20.00",
        "expiration_date": "2024-12-31T00:00:00.000Z",
        "is_active": true,
        "used_count": 5,
        "usage_limit": 100,
        "created_at": "2024-01-15T10:30:00.000Z",
        "collection": {
          "id": 1,
          "name": "Electronics"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "items_per_page": 10
    }
  }
}
```

### 3. Get Vendor Products
**GET** `/api/coupons/vendor/products`

Get all products belonging to the authenticated vendor for coupon creation.

**Query Parameters:**
- `search` (optional): Search by product name
- `category_id` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "price": 99999,
      "stock": 50,
      "subcategory_id": 1,
      "vendor": {
        "id": 2,
        "email": "vendor@example.com"
      }
    }
  ]
}
```

### 4. Get Collections
**GET** `/api/coupons/collections`

Get all available collections/categories for coupon creation.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics"
    },
    {
      "id": 2,
      "name": "Fashion",
      "slug": "fashion"
    }
  ]
}
```

### 5. Get Coupon Details
**GET** `/api/coupons/:id`

Get detailed information about a specific coupon including usage statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": 1,
      "code": "SAVE20",
      "vendor_id": 2,
      "product_type": "collection",
      "coupon_type": "discount",
      "discount_value": "20.00",
      "expiration_date": "2024-12-31T00:00:00.000Z",
      "is_active": true,
      "used_count": 5,
      "usage_limit": 100,
      "collection": {
        "id": 1,
        "name": "Electronics"
      },
      "usages": [
        {
          "id": 1,
          "discount_amount": "200.00",
          "order_amount": "1000.00",
          "used_at": "2024-01-15T12:00:00.000Z",
          "user": {
            "id": 3,
            "email": "customer@example.com"
          }
        }
      ]
    },
    "stats": {
      "total_uses": 5,
      "total_discount_given": "1000.00",
      "total_order_value": "5000.00",
      "avg_discount": "200.00",
      "avg_order_value": "1000.00"
    }
  }
}
```

### 6. Update Coupon
**PUT** `/api/coupons/:id`

Update an existing coupon. Only certain fields can be updated.

**Request Body:**
```json
{
  "discount_value": 25.00,
  "expiration_date": "2024-12-31",
  "usage_limit": 150,
  "minimum_order_amount": 600.00,
  "is_active": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    // Updated coupon object
  }
}
```

### 7. Delete Coupon
**DELETE** `/api/coupons/:id`

Delete a coupon. Only unused coupons can be deleted.

**Response:**
```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

## Customer Endpoints

### 8. Validate Coupon
**POST** `/api/coupons/validate`

Validate a coupon code and calculate discount for customer's order.

**Headers:**
```
Authorization: Bearer <customer_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "SAVE20",
  "order_amount": 1000.00,
  "product_ids": [1, 2, 3] // optional, for product-specific coupons
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon is valid",
  "data": {
    "coupon_id": 1,
    "code": "SAVE20",
    "discount_amount": 200.00,
    "coupon_type": "discount",
    "discount_value": "20.00",
    "final_amount": 800.00
  }
}
```

## Error Responses

### Validation Errors
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "code",
      "message": "Coupon code cannot be empty"
    }
  ]
}
```

### Not Found
```json
{
  "success": false,
  "message": "Coupon not found"
}
```

### Unauthorized
```json
{
  "success": false,
  "message": "Vendor access required"
}
```

### Coupon Validation Errors
```json
{
  "success": false,
  "message": "Coupon has expired"
}
```

## Database Schema

### Coupons Table
```sql
CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  vendor_id INT NOT NULL,
  product_type ENUM('collection', 'product') NOT NULL,
  collection_id INT NULL,
  product_id INT NULL,
  coupon_type ENUM('discount', 'flat_off') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  expiration_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  usage_limit INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  minimum_order_amount DECIMAL(10,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Coupon Usage Table
```sql
CREATE TABLE coupon_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  order_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
