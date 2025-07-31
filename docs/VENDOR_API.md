# Vendor API Documentation

This document describes the vendor management APIs that allow vendors to register, login, and manage their products in the ecommerce store.

## Overview

The vendor system allows users with the "vendor" role to:
- Register and login as vendors
- Manage their own products (create, read, update, delete)
- View their vendor statistics
- Update their profile

## Authentication & Authorization

Vendor endpoints use JWT token-based authentication:
1. **Public endpoints**: Registration and login (no authentication required)
2. **Protected endpoints**: All other endpoints require:
   - Valid JWT token in Authorization header (`Bearer <token>`)
   - User must have `role: 'vendor'` in their account

## Base URLs
```
Vendor Auth: http://localhost:5000/api/vendor
Vendor Products: http://localhost:5000/api/vendor/products
```

## Vendor Authentication Endpoints

### 1. Register Vendor
**POST** `/api/vendor/register`

Register a new vendor account.

**Request Body:**
```json
{
  "email": "vendor@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Vendor registered successfully",
  "data": {
    "vendor": {
      "id": 1,
      "email": "vendor@example.com",
      "role": "vendor"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Vendor Login
**POST** `/api/vendor/login`

Login as a vendor.

**Request Body:**
```json
{
  "email": "vendor@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor login successful",
  "data": {
    "vendor": {
      "id": 1,
      "email": "vendor@example.com",
      "role": "vendor"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Vendor Profile Endpoints

### 3. Get Vendor Profile
**GET** `/api/vendor/profile`

Get the authenticated vendor's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor profile retrieved successfully",
  "data": {
    "vendor": {
      "id": 1,
      "email": "vendor@example.com",
      "role": "vendor"
    }
  }
}
```

### 4. Update Vendor Profile
**PUT** `/api/vendor/profile`

Update the authenticated vendor's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor profile updated successfully",
  "data": {
    "vendor": {
      "id": 1,
      "email": "newemail@example.com",
      "role": "vendor"
    }
  }
}
```

### 5. Get Vendor Statistics
**GET** `/api/vendor/stats`

Get statistics for the authenticated vendor's products.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor statistics retrieved successfully",
  "data": {
    "stats": {
      "totalProducts": 25,
      "totalStock": 1250,
      "lowStockProducts": 3,
      "recentProducts": [
        {
          "id": 1,
          "name": "Product 1",
          "stock": 50,
          "price": 2999
        }
      ]
    }
  }
}
```

## Vendor Product Management Endpoints

### 6. Get Vendor Products
**GET** `/api/vendor/products`

Get all products owned by the authenticated vendor with pagination and filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12, max: 50)
- `category` (optional): Filter by subcategory ID
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sortBy` (optional): Sort field (id, name, price, stock, created_at)
- `sortOrder` (optional): Sort order (ASC, DESC)
- `search` (optional): Search by product name

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor products retrieved successfully",
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Vendor Product 1",
        "price": 2999,
        "stock": 50,
        "vendor_id": 1,
        "subcategory": {
          "id": 1,
          "name": "T-Shirts",
          "slug": "t-shirts"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalProducts": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 7. Get Single Vendor Product
**GET** `/api/vendor/products/:id`

Get a single product by ID (only if owned by the authenticated vendor).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "product": {
      "id": 1,
      "name": "Vendor Product 1",
      "description": "Product description",
      "price": 2999,
      "stock": 50,
      "vendor_id": 1,
      "subcategory": {
        "id": 1,
        "name": "T-Shirts",
        "slug": "t-shirts"
      }
    }
  }
}
```

### 8. Create Vendor Product
**POST** `/api/vendor/products`

Create a new product for the authenticated vendor.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New Vendor Product",
  "description": "Product description",
  "price": 2999,
  "stock": 100,
  "discount": 10,
  "subcategory_id": 1,
  "color": "Blue",
  "size": "M",
  "image_1_url": "https://example.com/image1.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "id": 26,
      "name": "New Vendor Product",
      "price": 2999,
      "stock": 100,
      "vendor_id": 1,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 9. Update Vendor Product
**PUT** `/api/vendor/products/:id`

Update a product (only if owned by the authenticated vendor).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 3499,
  "stock": 75
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      "id": 1,
      "name": "Updated Product Name",
      "price": 3499,
      "stock": 75,
      "vendor_id": 1
    }
  }
}
```

### 10. Delete Vendor Product
**DELETE** `/api/vendor/products/:id`

Delete a product (only if owned by the authenticated vendor).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "deletedProductId": "1"
  }
}
```

## Error Responses

All endpoints may return these error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error message",
  "error": "Detailed error description"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Vendor access required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Product not found or access denied"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Setup Instructions

1. **Run Database Migration:**
   ```bash
   node backend/scripts/migrateVendorSchema.js
   ```

2. **Start Server:**
   ```bash
   npm start
   ```

3. **Test APIs:**
   ```bash
   node backend/scripts/testVendorAPIs.js
   ```

## Security Features

- JWT token-based authentication
- Role-based access control (vendor role required)
- Vendors can only access/modify their own products
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection protection through Sequelize ORM

## Database Schema Changes

The vendor system adds:
- `vendor` role to User table's role enum
- `vendor_id` column to Product table
- User-Product association for vendor ownership
