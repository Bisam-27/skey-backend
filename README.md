# Skeyy E-commerce Backend

A comprehensive Node.js backend API for the Skeyy e-commerce platform, built with Express.js and Sequelize ORM.

## 🚀 Overview

This backend serves as the core API for the Skeyy e-commerce platform, providing robust functionality for product management, user authentication, order processing, and administrative operations. It supports multi-tenant vendor operations and comprehensive e-commerce features.

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MySQL with Sequelize ORM 6.37.7
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer 2.0.2
- **CORS**: cors 2.8.5
- **Environment Variables**: dotenv 17.2.0
- **HTTP Client**: axios 1.11.0

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                    # Database configuration
├── controllers/
│   ├── adminCouponController.js      # Admin coupon management
│   ├── adminDashboardController.js   # Admin dashboard data
│   ├── adminHomepageController.js    # Homepage content management
│   ├── adminOrderController.js       # Admin order management
│   ├── adminProductController.js     # Admin product management
│   ├── authController.js             # Authentication logic
│   ├── cartController.js             # Shopping cart operations
│   ├── categoryController.js         # Category management
│   ├── checkoutController.js         # Order processing
│   ├── couponController.js           # Coupon validation
│   ├── couponUsageController.js      # Coupon usage tracking
│   ├── homepageController.js         # Homepage data
│   ├── productController.js          # Product operations
│   ├── userController.js             # User management
│   ├── vendorController.js           # Vendor operations
│   ├── vendorProductController.js    # Vendor product management
│   └── wishlistController.js         # Wishlist operations
├── docs/
│   ├── ADMIN_HOMEPAGE_API.md         # Admin homepage API docs
│   ├── ADMIN_SETUP_GUIDE.md          # Admin setup guide
│   ├── COUPON_API.md                 # Coupon system API docs
│   ├── COUPON_SYSTEM_SUMMARY.md      # Coupon system overview
│   ├── FRONTEND_COUPON_INTEGRATION.md # Frontend integration guide
│   ├── HOMEPAGE_API.md               # Homepage API docs
│   ├── USER_MANAGEMENT_API.md        # User management API docs
│   └── VENDOR_API.md                 # Vendor API documentation
├── middleware/
│   ├── auth.js                       # Authentication middleware
│   └── upload.js                     # File upload middleware
├── migrations/
│   └── add_cart_coupon_fields.sql    # Database migrations
├── models/
│   ├── address.js                    # Address model
│   ├── associations.js               # Model relationships
│   ├── banner.js                     # Banner model
│   ├── brand.js                      # Brand model
│   ├── cart.js                       # Cart model
│   ├── category.js                   # Category model
│   ├── coupon.js                     # Coupon model
│   ├── couponUsage.js               # Coupon usage model
│   ├── feature.js                    # Feature model
│   ├── order.js                      # Order model
│   ├── orderItem.js                  # Order item model
│   ├── product.js                    # Product model
│   ├── subcategory.js               # Subcategory model
│   ├── testimonial.js               # Testimonial model
│   ├── user.js                       # User model
│   └── wishlist.js                   # Wishlist model
├── routes/
│   ├── adminCouponRoutes.js          # Admin coupon routes
│   ├── adminDashboardRoutes.js       # Admin dashboard routes
│   ├── adminHomepageRoutes.js        # Admin homepage routes
│   ├── adminOrderRoutes.js           # Admin order routes
│   ├── adminProductRoutes.js         # Admin product routes
│   ├── authRoutes.js                 # Authentication routes
│   ├── cartRoutes.js                 # Cart routes
│   ├── categoryRoutes.js             # Category routes
│   ├── checkoutRoutes.js             # Checkout routes
│   ├── couponRoutes.js               # Coupon routes
│   ├── homepageRoutes.js             # Homepage routes
│   ├── productRoutes.js              # Product routes
│   ├── userRoutes.js                 # User routes
│   ├── vendorProductRoutes.js        # Vendor product routes
│   ├── vendorRoutes.js               # Vendor routes
│   └── wishlistRoutes.js             # Wishlist routes
├── scripts/
│   ├── addCartCouponFields.js        # Cart coupon migration
│   ├── createAdminUser.js            # Admin user creation
│   ├── createCouponTables.js         # Coupon table creation
│   ├── migrateUserRole.js            # User role migration
│   ├── seedDatabase.js               # Database seeding
│   └── vendorMigration.js            # Vendor migration
├── test/                             # Test files
├── uploads/
│   └── products/                     # Product image uploads
├── package.json                      # Dependencies and scripts
├── package-lock.json                 # Dependency lock file
└── server.js                         # Main server file
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager

### Installation Steps

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=localhost
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Database Setup**
   - Create a MySQL database
   - Run the application to auto-sync models
   - Optionally run seeding scripts

5. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 🌐 API Endpoints

### Server Information
- **Base URL**: `http://localhost:5000`
- **Frontend**: `http://localhost:5000`
- **Admin Panel**: `http://localhost:5000/admin`
- **Health Check**: `http://localhost:5000/api/health`

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Product Routes (`/api/products`)
- `GET /` - Get all products (with filtering, pagination)
- `GET /search` - Search products
- `GET /:id` - Get product by ID
- `POST /` - Create product (Admin/Vendor)
- `PUT /:id` - Update product (Admin/Vendor)
- `DELETE /:id` - Delete product (Admin/Vendor)

### Category Routes (`/api/categories`)
- `GET /` - Get all categories
- `GET /:id` - Get category by ID
- `GET /:id/subcategories` - Get subcategories

### Cart Routes (`/api/cart`)
- `GET /` - Get user cart
- `POST /add` - Add item to cart
- `PUT /update` - Update cart item
- `DELETE /remove` - Remove item from cart
- `DELETE /clear` - Clear cart

### Wishlist Routes (`/api/wishlist`)
- `GET /` - Get user wishlist
- `POST /toggle` - Toggle wishlist item
- `DELETE /` - Clear wishlist

### Order Routes (`/api/checkout`)
- `POST /` - Process checkout
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details

### Coupon Routes (`/api/coupons`)
- `POST /validate` - Validate coupon code
- `GET /` - Get available coupons

### Admin Routes
#### Dashboard (`/api/admin/dashboard`)
- `GET /stats` - Get dashboard statistics

#### Products (`/api/admin/products`)
- `GET /` - Get all products (admin view)
- `POST /` - Create product
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product
- `GET /vendors` - Get all vendors
- `GET /brands` - Get all brands

#### Orders (`/api/admin/orders`)
- `GET /` - Get all orders
- `GET /stats` - Get order statistics
- `GET /fulfilled` - Get fulfilled orders
- `GET /unfulfilled` - Get unfulfilled orders
- `PUT /:id/status` - Update order status

#### Users (`/api/users`)
- `GET /` - Get all users
- `GET /stats` - Get user statistics
- `GET /:id` - Get user by ID

#### Coupons (`/api/admin/coupons`)
- `GET /` - Get all coupons
- `POST /` - Create coupon
- `PUT /:id` - Update coupon
- `DELETE /:id` - Delete coupon

### Vendor Routes (`/api/vendor`)
- `POST /register` - Vendor registration
- `POST /login` - Vendor login
- `GET /profile` - Get vendor profile
- `PUT /profile` - Update vendor profile
- `GET /stats` - Get vendor statistics

#### Vendor Products (`/api/vendor/products`)
- `GET /` - Get vendor products
- `POST /` - Create vendor product
- `PUT /:id` - Update vendor product
- `DELETE /:id` - Delete vendor product

## 🔐 Authentication & Authorization

### User Roles
- **User**: Regular customers
- **Vendor**: Product sellers
- **Admin**: System administrators

### JWT Authentication
- Tokens are required for protected routes
- Include in Authorization header: `Bearer <token>`
- Tokens contain user ID and role information

### Middleware
- `authenticateToken`: Verifies JWT token
- `requireAdmin`: Requires admin role
- `requireVendor`: Requires vendor role

## 📊 Database Models

### Core Models
- **User**: User accounts with roles (user/vendor/admin)
- **Product**: Product catalog with vendor association
- **Category/Subcategory**: Product categorization
- **Cart**: Shopping cart items
- **Order/OrderItem**: Order management
- **Wishlist**: User wishlists

### E-commerce Features
- **Coupon**: Discount coupons with various types
- **CouponUsage**: Coupon usage tracking
- **Address**: User addresses
- **Brand**: Product brands

### Content Management
- **Banner**: Homepage banners
- **Testimonial**: Customer testimonials
- **Feature**: Platform features

## 🎯 Key Features

### Multi-tenant Architecture
- Vendor-specific product management
- Role-based access control
- Isolated vendor operations

### Advanced E-commerce
- Comprehensive cart management
- Coupon system with stacking discounts
- Order processing with inventory updates
- Wishlist functionality

### Admin Dashboard
- Real-time statistics
- Order management (fulfilled/unfulfilled)
- User and vendor management
- Product and coupon management

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation and sanitization

## 🚀 Scripts

```bash
# Start server
npm start

# Development mode
npm run dev

# Setup coupon tables
npm run setup:coupons
```

## 📝 Environment Variables

```env
# Database Configuration
DB_NAME=skeyy_ecommerce
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 🔄 Database Relationships

- Users can be customers, vendors, or admins
- Vendors can create and manage their own products
- Products belong to categories and subcategories
- Orders contain multiple order items
- Coupons can be vendor-specific or global
- Cart items are associated with users and products

## 📈 Performance Features

- Database indexing for optimized queries
- Pagination for large datasets
- Image upload optimization
- Efficient relationship loading

## 🛡️ Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Role-based access control

## 🔧 Maintenance

### Database Migrations
- Located in `/migrations` folder
- Run manually or through scripts
- Version-controlled schema changes

### File Uploads
- Product images stored in `/uploads/products`
- Handled by Multer middleware
- Configurable file size limits

## 📞 Support

For technical support or questions about the backend API, refer to the documentation in the `/docs` folder or contact the development team.
