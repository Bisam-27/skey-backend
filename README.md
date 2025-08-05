# 🚀 Skeyy Backend API

The backend API server for the Skeyy e-commerce platform built with Node.js, Express.js, and MySQL with comprehensive Google OAuth integration.

## 🔗 Related Repositories

- **Backend API**: [https://github.com/Bisam-27/skey-backend](https://github.com/Bisam-27/skey-backend) (This Repository)
- **Frontend Portal**: [https://github.com/Bisam-27/skey-frontend](https://github.com/Bisam-27/skey-frontend)
- **Admin Panel**: [https://github.com/Bisam-27/skey-adminpannel](https://github.com/Bisam-27/skey-adminpannel)
- **Vendor Panel**: [https://github.com/Bisam-27/skey-vendorpannel](https://github.com/Bisam-27/skey-vendorpannel)

## 📚 Documentation Links

- [Frontend Documentation](https://github.com/Bisam-27/skey-frontend#readme)
- [Admin Panel Documentation](https://github.com/Bisam-27/skey-adminpannel#readme)
- [Vendor Panel Documentation](https://github.com/Bisam-27/skey-vendorpannel#readme)

## 🌟 Features

- **RESTful API Architecture**: Clean, scalable API design
- **JWT Authentication**: Secure token-based authentication
- **Google OAuth Integration**: One-click signup/login with role selection
- **Role-based Access Control**: User, Vendor, Admin roles
- **MySQL Database**: Sequelize ORM with optimized queries
- **File Upload Support**: Multer for image and document uploads
- **Real-time Search**: Advanced product search functionality
- **Comprehensive Error Handling**: Consistent error responses
- **Input Validation**: Server-side validation and sanitization

## 🛠️ Tech Stack

- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT, Google OAuth 2.0, Passport.js
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Environment Config**: dotenv
- **HTTP Client**: Axios
- **Security**: CORS, Input validation

## 📦 Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create `.env` file:
```env
# Database Configuration
DB_NAME=skey
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### 3. Database Setup
```bash
# Create MySQL database 'skey'
# Run migrations
node scripts/addGoogleOAuthFields.js
npm run setup:coupons
```

### 4. Start Server
```bash
npm start          # Production
npm run dev        # Development
```

Server runs on `http://localhost:5000`

## 🔐 Authentication System

### Traditional Authentication
- Email/password registration and login
- JWT token generation and validation
- Role-based access control

### Google OAuth Flow
1. **Frontend**: User clicks "Sign in with Google"
2. **Google**: User authenticates with Google
3. **Backend**: Receives Google ID token
4. **Validation**: Verifies token with Google
5. **User Check**: Checks if user exists
6. **Role Selection**: New users select role (Customer/Vendor)
7. **Account Creation**: Creates user with selected role
8. **JWT Generation**: Returns JWT token for session

### Security Features
- Password hashing with bcryptjs (10 salt rounds)
- JWT tokens with expiration
- Google OAuth token verification
- Role-based middleware protection
- Input validation and sanitization
- CORS protection

## 📊 Database Models

### User Model
```javascript
{
  id: INTEGER (PK, Auto-increment),
  email: STRING(255) (Unique, Required),
  password: STRING(255) (Nullable for Google OAuth),
  googleId: STRING(255) (Unique, Nullable),
  name: STRING(255) (Nullable),
  profilePicture: TEXT (Nullable),
  role: ENUM('user', 'vendor', 'admin') (Default: 'user')
}
```

### VendorProfile Model
```javascript
{
  id: INTEGER (PK),
  user_id: INTEGER (FK to User),
  business_name: STRING (Required),
  contact_name: STRING (Required),
  mobile_number: STRING (Required),
  gst_number: STRING,
  business_address: TEXT (Required),
  bank_name: STRING,
  pan_number: STRING
}
```

### Product Model
```javascript
{
  id: INTEGER (PK),
  name: STRING (Required),
  description: TEXT,
  price: DECIMAL(10,2) (Required),
  discountedPrice: DECIMAL(10,2),
  stock: INTEGER (Default: 0),
  images: JSON (Array of image paths),
  categoryId: INTEGER (FK),
  subcategoryId: INTEGER (FK),
  vendorId: INTEGER (FK)
}
```

## 🛣️ API Routes

### Authentication Routes (`/api/auth`)

#### `POST /api/auth/register`
Register new user with email/password

#### `POST /api/auth/login`
Login with email/password

#### `POST /api/auth/google`
Google OAuth login/signup with role selection

#### `POST /api/auth/google/check`
Check if Google user exists

#### `GET /api/auth/profile` 🔒
Get current user profile (requires authentication)

### Product Routes (`/api/products`)

#### `GET /api/products`
Get products with filtering and pagination

#### `GET /api/products/:id`
Get single product details

#### `GET /api/products/search`
Real-time product search

### Admin Routes (`/api/admin/*`) 🔒👑

#### Dashboard (`/api/admin/dashboard`)
- `GET /stats` - Platform statistics
- `GET /recent-orders` - Recent orders
- `GET /top-products` - Top-selling products

#### User Management (`/api/users`)
- `GET /` - All users with pagination
- `GET /:id` - Specific user details
- `GET /stats` - User statistics

### Vendor Routes (`/api/vendor/*`) 🔒🏪

#### Registration (`/api/vendor/register`)
- `POST /` - Register vendor with business details

#### Product Management (`/api/vendor/products`)
- `GET /` - Vendor's products only
- `POST /` - Create new product
- `PUT /:id` - Update own product
- `DELETE /:id` - Delete own product

## 🔒 Middleware & Security

### Authentication Middleware
- `authenticateToken`: Verifies JWT token
- `requireAdmin`: Admin role required
- `requireVendor`: Vendor role required
- `optionalAuth`: Optional authentication

### Security Features
- JWT token validation
- Role-based access control
- Input validation and sanitization
- Password hashing (bcryptjs)
- Google OAuth token verification
- CORS protection
- File upload validation

## 📁 File Structure

```
backend/
├── config/
│   ├── db.js              # Database connection
│   └── passport.js        # Google OAuth config
├── controllers/           # Business logic
├── middleware/           # Authentication & validation
├── models/              # Database models
├── routes/              # API endpoints
├── scripts/             # Database migrations
├── uploads/             # File uploads
├── .env                 # Environment variables
├── server.js           # Main server file
└── package.json        # Dependencies
```

## 🚀 Deployment

### Production Considerations
- Use PM2 for process management
- Set up nginx reverse proxy
- Enable HTTPS with SSL certificates
- Configure database connection pooling
- Set up monitoring and logging

## 🔧 Development

### Database Migrations
```bash
# Add Google OAuth support
node scripts/addGoogleOAuthFields.js

# Setup coupon system
npm run setup:coupons
```

### API Testing
```bash
curl -H "Authorization: Bearer jwt_token" \
     http://localhost:5000/api/auth/profile
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**
   - Verify MySQL is running
   - Check `.env` credentials
   - Ensure database `skey` exists

2. **Google OAuth**
   - Verify Google Cloud Console setup
   - Check client ID/secret in `.env`
   - Ensure authorized origins are configured

3. **JWT Issues**
   - Check JWT_SECRET is set
   - Verify token format: `Bearer <token>`
   - Check token expiration

---

**🛍️ Skeyy Backend API - Powering Modern E-Commerce**
