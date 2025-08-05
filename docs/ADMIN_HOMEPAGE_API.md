# Admin Homepage Management API Documentation

This document describes the admin-only APIs for managing homepage content including banners, testimonials, and features. All endpoints require admin authentication.

## Authentication & Authorization

All admin homepage endpoints require:
1. **Authentication**: Valid JWT token in Authorization header (`Bearer <token>`)
2. **Admin Role**: User must have `role: 'admin'` in their account

## Base URL
```
http://localhost:5000/api/admin/homepage
```

## Banner Management

### 1. Get All Banners
**GET** `/api/admin/homepage/banners`

Retrieve all banners with filtering, pagination, and sorting.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `type` (optional): Filter by type ('hero', 'promotional', 'announcement')
- `is_active` (optional): Filter by active status ('true' or 'false')
- `sortBy` (optional): Sort field ('id', 'title', 'type', 'position', 'is_active', 'created_at')
- `sortOrder` (optional): Sort direction ('ASC' or 'DESC')

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/admin/homepage/banners?type=hero&is_active=true&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "id": 1,
        "title": "Summer Collection 2024",
        "subtitle": "Discover the latest trends",
        "description": "Shop our exclusive summer collection with up to 50% off on selected items",
        "image_url": "img/carousel-1.jpg",
        "mobile_image_url": "img/carousel-1-mobile.jpg",
        "link_url": "/browse.html?category=summer",
        "link_text": "Shop Now",
        "type": "hero",
        "position": 1,
        "is_active": true,
        "start_date": null,
        "end_date": null,
        "background_color": "#f8f9fa",
        "text_color": "#333333",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalBanners": 15,
      "bannersPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Create Banner
**POST** `/api/admin/homepage/banners`

Create a new banner.

#### Request Body
```json
{
  "title": "New Banner Title",
  "subtitle": "Optional subtitle",
  "description": "Banner description",
  "image_url": "img/new-banner.jpg",
  "mobile_image_url": "img/new-banner-mobile.jpg",
  "link_url": "/browse.html",
  "link_text": "Shop Now",
  "type": "hero",
  "position": 1,
  "is_active": true,
  "start_date": "2024-01-01T00:00:00.000Z",
  "end_date": "2024-12-31T23:59:59.000Z",
  "background_color": "#ffffff",
  "text_color": "#000000"
}
```

#### Required Fields
- `title`: Banner title
- `image_url`: Banner image URL

#### Example Request
```bash
curl -X POST "http://localhost:5000/api/admin/homepage/banners" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Banner", "image_url": "img/banner.jpg", "type": "hero"}'
```

### 3. Update Banner
**PUT** `/api/admin/homepage/banners/:id`

Update an existing banner.

#### Example Request
```bash
curl -X PUT "http://localhost:5000/api/admin/homepage/banners/1" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Banner Title", "is_active": false}'
```

### 4. Delete Banner
**DELETE** `/api/admin/homepage/banners/:id`

Delete a banner permanently.

#### Example Request
```bash
curl -X DELETE "http://localhost:5000/api/admin/homepage/banners/1" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 5. Get Single Banner
**GET** `/api/admin/homepage/banners/:id`

Get details of a specific banner.

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/admin/homepage/banners/1" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

## Testimonial Management

### 1. Get All Testimonials
**GET** `/api/admin/homepage/testimonials`

#### Query Parameters
- `page`, `limit`: Pagination
- `is_featured`: Filter by featured status
- `is_active`: Filter by active status
- `rating`: Filter by rating (1-5)
- `sortBy`: Sort field ('id', 'name', 'rating', 'position', 'is_featured', 'is_active', 'created_at')
- `sortOrder`: Sort direction

### 2. Create Testimonial
**POST** `/api/admin/homepage/testimonials`

#### Request Body
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "rating": 5,
  "review": "Great product and service!",
  "product_id": 123,
  "image_url": "img/customer.jpg",
  "location": "Mumbai, Maharashtra",
  "is_featured": true,
  "is_verified": true,
  "is_active": true,
  "position": 1
}
```

#### Required Fields
- `name`: Customer name
- `review`: Review text

### 3. Update Testimonial
**PUT** `/api/admin/homepage/testimonials/:id`

### 4. Delete Testimonial
**DELETE** `/api/admin/homepage/testimonials/:id`

### 5. Get Single Testimonial
**GET** `/api/admin/homepage/testimonials/:id`

## Feature Management

### 1. Get All Features
**GET** `/api/admin/homepage/features`

#### Query Parameters
- `page`, `limit`: Pagination
- `type`: Filter by type ('why_choose_us', 'service', 'benefit')
- `is_active`: Filter by active status
- `sortBy`: Sort field ('id', 'title', 'type', 'position', 'is_active', 'created_at')
- `sortOrder`: Sort direction

### 2. Create Feature
**POST** `/api/admin/homepage/features`

#### Request Body
```json
{
  "title": "Feature Title",
  "description": "Feature description",
  "icon_url": "img/icon.svg",
  "icon_class": "fas fa-shield",
  "type": "why_choose_us",
  "position": 1,
  "is_active": true,
  "background_color": "#ffffff",
  "text_color": "#000000"
}
```

#### Required Fields
- `title`: Feature title
- `description`: Feature description

### 3. Update Feature
**PUT** `/api/admin/homepage/features/:id`

### 4. Delete Feature
**DELETE** `/api/admin/homepage/features/:id`

### 5. Get Single Feature
**GET** `/api/admin/homepage/features/:id`

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Title and image URL are required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Banner not found"
}
```

## Data Validation

### Banner Validation
- `title`: Required, 2-255 characters
- `image_url`: Required, valid URL
- `type`: Must be 'hero', 'promotional', or 'announcement'
- `start_date`: Must be before end_date if both provided
- `position`: Integer

### Testimonial Validation
- `name`: Required, 2-255 characters
- `review`: Required, 10-2000 characters
- `rating`: Required, 1-5 integer
- `email`: Valid email format if provided

### Feature Validation
- `title`: Required, 2-255 characters
- `description`: Required, 10-1000 characters
- `type`: Must be 'why_choose_us', 'service', or 'benefit'
- `position`: Integer

## Security Features

- **Admin-only Access**: All endpoints require admin role
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Protection**: Using Sequelize ORM with parameterized queries
- **XSS Protection**: Input sanitization
- **Rate Limiting**: Recommended for production use

## Usage Examples

### Complete Banner Management Flow
```bash
# 1. Login as admin
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# 2. Create banner
curl -X POST "http://localhost:5000/api/admin/homepage/banners" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Sale", "image_url": "img/sale.jpg", "type": "promotional"}'

# 3. Update banner
curl -X PUT "http://localhost:5000/api/admin/homepage/banners/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'

# 4. Get all banners
curl -X GET "http://localhost:5000/api/admin/homepage/banners" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

All admin APIs follow the same authentication pattern and provide comprehensive CRUD operations for managing homepage content.
