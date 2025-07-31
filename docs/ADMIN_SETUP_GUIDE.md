# Admin Homepage Management Setup Guide

This guide shows you how to set up and use the admin-only homepage management APIs.

## 🚀 Quick Setup

### 1. Ensure Admin User Exists
```bash
# Create admin user if not exists
node backend/scripts/createAdminUser.js
```

This creates an admin user with:
- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`

### 2. Seed Homepage Content (Optional)
```bash
# Add sample homepage content
node backend/scripts/seedHomepage.js
```

### 3. Test Admin APIs
```bash
# Run comprehensive admin API tests
node backend/test/adminHomepageApiTest.js
```

## 🔐 Getting Admin Access

### Step 1: Login as Admin
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 2: Use the Token
Copy the token from the response and use it in all admin API calls:

```bash
export ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📝 Common Admin Operations

### Banner Management

#### Create a New Hero Banner
```bash
curl -X POST "http://localhost:5000/api/admin/homepage/banners" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Year Sale",
    "subtitle": "Up to 70% Off",
    "description": "Start the year with amazing deals on all categories",
    "image_url": "img/new-year-banner.jpg",
    "mobile_image_url": "img/new-year-banner-mobile.jpg",
    "link_url": "/browse.html?sale=new-year",
    "link_text": "Shop Now",
    "type": "hero",
    "position": 1,
    "is_active": true,
    "background_color": "#ff6b6b",
    "text_color": "#ffffff"
  }'
```

#### Get All Banners
```bash
curl -X GET "http://localhost:5000/api/admin/homepage/banners?type=hero&is_active=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### Update a Banner
```bash
curl -X PUT "http://localhost:5000/api/admin/homepage/banners/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false, "title": "Updated Banner Title"}'
```

#### Delete a Banner
```bash
curl -X DELETE "http://localhost:5000/api/admin/homepage/banners/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Testimonial Management

#### Create a New Testimonial
```bash
curl -X POST "http://localhost:5000/api/admin/homepage/testimonials" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "rating": 5,
    "review": "Absolutely love shopping here! The quality is amazing and delivery is super fast.",
    "location": "New York, USA",
    "is_featured": true,
    "is_verified": true,
    "position": 1
  }'
```

#### Get All Testimonials
```bash
curl -X GET "http://localhost:5000/api/admin/homepage/testimonials?is_featured=true&rating=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Feature Management

#### Create a New Feature
```bash
curl -X POST "http://localhost:5000/api/admin/homepage/features" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "24/7 Customer Support",
    "description": "Our dedicated support team is available round the clock to help you.",
    "icon_url": "img/support-icon.svg",
    "type": "why_choose_us",
    "position": 1
  }'
```

#### Get All Features
```bash
curl -X GET "http://localhost:5000/api/admin/homepage/features?type=why_choose_us" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 🎯 API Endpoints Summary

### Banner Endpoints
- `GET /api/admin/homepage/banners` - List all banners
- `POST /api/admin/homepage/banners` - Create banner
- `GET /api/admin/homepage/banners/:id` - Get single banner
- `PUT /api/admin/homepage/banners/:id` - Update banner
- `DELETE /api/admin/homepage/banners/:id` - Delete banner

### Testimonial Endpoints
- `GET /api/admin/homepage/testimonials` - List all testimonials
- `POST /api/admin/homepage/testimonials` - Create testimonial
- `GET /api/admin/homepage/testimonials/:id` - Get single testimonial
- `PUT /api/admin/homepage/testimonials/:id` - Update testimonial
- `DELETE /api/admin/homepage/testimonials/:id` - Delete testimonial

### Feature Endpoints
- `GET /api/admin/homepage/features` - List all features
- `POST /api/admin/homepage/features` - Create feature
- `GET /api/admin/homepage/features/:id` - Get single feature
- `PUT /api/admin/homepage/features/:id` - Update feature
- `DELETE /api/admin/homepage/features/:id` - Delete feature

## 🔒 Security Features

### Authentication Required
All admin endpoints require:
1. Valid JWT token in `Authorization: Bearer <token>` header
2. User must have `role: 'admin'`

### Input Validation
- All required fields are validated
- Data types and formats are checked
- SQL injection protection via Sequelize ORM
- XSS protection through input sanitization

### Error Handling
- Consistent error response format
- Detailed error messages for debugging
- Proper HTTP status codes

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Access token is required"
**Solution**: Include the Authorization header with Bearer token

#### 2. "Admin access required"
**Solution**: Ensure your user has `role: 'admin'`

#### 3. "Banner not found"
**Solution**: Check if the banner ID exists in the database

#### 4. Token expired
**Solution**: Login again to get a new token

### Debug Commands

```bash
# Check if admin user exists
curl -X GET "http://localhost:5000/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Verify token is valid
curl -X GET "http://localhost:5000/api/auth/profile" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Test server connection
curl -X GET "http://localhost:5000/api/homepage"
```

## 📊 Monitoring & Analytics

### Track Content Performance
- Monitor which banners get the most clicks
- Track testimonial engagement
- Analyze feature effectiveness

### Content Management Best Practices
1. **Regular Updates**: Keep banners fresh and relevant
2. **A/B Testing**: Test different banner designs
3. **Seasonal Content**: Update for holidays and events
4. **Mobile Optimization**: Ensure mobile images are provided
5. **Performance**: Monitor loading times for images

## 🎨 Frontend Integration

The admin APIs work seamlessly with the public homepage APIs:

- **Public API**: `GET /api/homepage` (no auth required)
- **Admin APIs**: `POST/PUT/DELETE /api/admin/homepage/*` (admin auth required)

This separation ensures:
- Fast public access to homepage content
- Secure admin-only content management
- Clean separation of concerns

Your homepage content is now fully manageable by admin users while remaining publicly accessible for your customers!
