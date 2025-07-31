# Homepage API Documentation

This document describes the homepage content APIs that provide banners, testimonials, features, and other homepage content for the Skeyy e-commerce frontend.

## Base URL
```
http://localhost:5000/api/homepage
```

## Endpoints

### 1. Get All Homepage Content
**GET** `/api/homepage`

Retrieve all homepage content in a single API call for optimal performance.

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/homepage"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "heroBanners": [
      {
        "id": 1,
        "title": "Summer Collection 2024",
        "subtitle": "Discover the latest trends",
        "description": "Shop our exclusive summer collection with up to 50% off on selected items",
        "image_url": "img/carousel-1.jpg",
        "mobile_image_url": "img/carousel-1-mobile.jpg",
        "link_url": "/browse.html?category=summer",
        "link_text": "Shop Now",
        "background_color": "#f8f9fa",
        "text_color": "#333333"
      }
    ],
    "promotionalBanners": [
      {
        "id": 6,
        "title": "Mega Sale",
        "subtitle": "Up to 70% Off",
        "description": "Limited time offer on all categories",
        "image_url": "img/banner.jpg",
        "link_url": "/browse.html?sale=true",
        "link_text": "Shop Sale",
        "background_color": "#e17055",
        "text_color": "#ffffff"
      }
    ],
    "announcements": [
      {
        "id": 9,
        "title": "All DENIMS are 50% off! Shop Now",
        "subtitle": null,
        "link_url": "/browse.html?category=denim",
        "link_text": "Shop Denim",
        "background_color": "#6c5ce7",
        "text_color": "#ffffff"
      }
    ],
    "featuredCategories": [
      {
        "id": 1,
        "name": "Women",
        "slug": "women",
        "description": "Fashion and accessories for women",
        "image_url": null
      }
    ],
    "testimonials": [
      {
        "id": 1,
        "name": "Priya Sharma",
        "rating": 5,
        "review": "Amazing quality products! I love shopping at Skeyy. The delivery is always on time and the customer service is excellent.",
        "image_url": null,
        "location": "Mumbai, Maharashtra",
        "is_verified": true
      }
    ],
    "features": [
      {
        "id": 1,
        "title": "Secure Payments",
        "description": "We never ask for your bank or card details over call or in person.",
        "icon_url": "img/icon-cart.svg",
        "icon_class": null,
        "background_color": null,
        "text_color": null
      }
    ]
  }
}
```

### 2. Get Hero Banners
**GET** `/api/homepage/banners/hero`

Retrieve only the hero carousel banners.

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/homepage/banners/hero"
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
        "background_color": "#f8f9fa",
        "text_color": "#333333"
      }
    ]
  }
}
```

### 3. Get Promotional Banners
**GET** `/api/homepage/banners/promotional`

Retrieve promotional banners for the banner section.

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/homepage/banners/promotional"
```

### 4. Get Announcements
**GET** `/api/homepage/announcements`

Retrieve announcement banners for the top announcement bar.

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/homepage/announcements"
```

### 5. Get Featured Testimonials
**GET** `/api/homepage/testimonials`

Retrieve customer testimonials for the homepage.

#### Query Parameters
- `limit` (optional): Number of testimonials to return (default: 6, max: 20)

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/homepage/testimonials?limit=3"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "testimonials": [
      {
        "id": 1,
        "name": "Priya Sharma",
        "rating": 5,
        "review": "Amazing quality products! I love shopping at Skeyy. The delivery is always on time and the customer service is excellent.",
        "image_url": null,
        "location": "Mumbai, Maharashtra",
        "is_verified": true
      }
    ]
  }
}
```

### 6. Get Features
**GET** `/api/homepage/features`

Retrieve "Why Choose Us" features and other feature content.

#### Query Parameters
- `type` (optional): Feature type ('why_choose_us', 'service', 'benefit') (default: 'why_choose_us')

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/homepage/features?type=why_choose_us"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "features": [
      {
        "id": 1,
        "title": "Secure Payments",
        "description": "We never ask for your bank or card details over call or in person.",
        "icon_url": "img/icon-cart.svg",
        "icon_class": null,
        "background_color": null,
        "text_color": null
      }
    ]
  }
}
```

## Data Models

### Banner
- `id`: Unique identifier
- `title`: Banner title
- `subtitle`: Optional subtitle
- `description`: Detailed description
- `image_url`: Main banner image
- `mobile_image_url`: Mobile-specific image (optional)
- `link_url`: URL to redirect when clicked
- `link_text`: Call-to-action button text
- `background_color`: Hex color code
- `text_color`: Hex color code
- `type`: 'hero', 'promotional', or 'announcement'

### Testimonial
- `id`: Unique identifier
- `name`: Customer name
- `rating`: Rating (1-5)
- `review`: Review text
- `image_url`: Customer photo (optional)
- `location`: Customer location
- `is_verified`: Whether review is verified

### Feature
- `id`: Unique identifier
- `title`: Feature title
- `description`: Feature description
- `icon_url`: Icon image URL
- `icon_class`: CSS icon class (optional)
- `background_color`: Hex color code (optional)
- `text_color`: Hex color code (optional)

## Setup Instructions

1. **Seed Homepage Content**:
   ```bash
   node backend/scripts/seedHomepage.js
   ```

2. **Test APIs**:
   ```bash
   # Test all homepage content
   curl -X GET "http://localhost:5000/api/homepage"
   
   # Test individual endpoints
   curl -X GET "http://localhost:5000/api/homepage/banners/hero"
   curl -X GET "http://localhost:5000/api/homepage/testimonials"
   curl -X GET "http://localhost:5000/api/homepage/features"
   ```

## Error Responses

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error while fetching homepage content"
}
```

## Features

- **Performance Optimized**: Single API call for all homepage content
- **Mobile Support**: Separate mobile images for banners
- **Time-based Display**: Banners can have start/end dates
- **Flexible Content**: Support for multiple banner types
- **Verified Reviews**: Testimonials can be marked as verified
- **Customizable**: Colors and styling options for content
- **SEO Friendly**: Proper content structure for search engines

## Integration Notes

- All APIs return data in consistent format with `success` and `data` fields
- Images URLs are relative to your frontend assets folder
- Colors are provided as hex codes for easy CSS integration
- Content is automatically filtered by active status and date ranges
- Position/order fields ensure consistent content ordering
