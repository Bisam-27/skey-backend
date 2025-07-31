# User Management API Documentation

This document describes the admin-only user management APIs that allow administrators to view and manage user accounts.

## Authentication & Authorization

All user management endpoints require:
1. **Authentication**: Valid JWT token in Authorization header (`Bearer <token>`)
2. **Admin Role**: User must have `role: 'admin'` in their account

## Base URL
```
http://localhost:5000/api/users
```

## Endpoints

### 1. Get All Users
**GET** `/api/users`

Retrieve a paginated list of all users with optional filtering and sorting.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Users per page (default: 10, max: 100)
- `search` (optional): Search by email (partial match)
- `role` (optional): Filter by role ('user' or 'admin')
- `sortBy` (optional): Sort field ('id', 'email', 'role') (default: 'id')
- `sortOrder` (optional): Sort direction ('ASC' or 'DESC') (default: 'ASC')

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/users?page=1&limit=10&search=john&role=user&sortBy=email&sortOrder=ASC" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "john@example.com",
        "role": "user"
      },
      {
        "id": 2,
        "email": "jane@example.com",
        "role": "admin"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "usersPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Get User by ID
**GET** `/api/users/:id`

Retrieve details of a specific user by their ID.

#### Path Parameters
- `id`: User ID (integer)

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/users/123" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

### 3. Get User Statistics
**GET** `/api/users/stats`

Retrieve overall user statistics for admin dashboard.

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/users/stats" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "adminCount": 5,
    "regularUserCount": 145,
    "recentUsersCount": 12
  }
}
```

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

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Valid user ID is required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error while fetching users"
}
```

## Setup Instructions

1. **Add Role Field to Database**: The user table needs a `role` field. Run the admin user creation script to sync the model:
   ```bash
   node backend/scripts/createAdminUser.js
   ```

2. **Create Admin User**: The script above will create an admin user with:
   - Email: `admin@example.com`
   - Password: `admin123`
   - Role: `admin`

3. **Login as Admin**: Use the admin credentials to get a JWT token:
   ```bash
   curl -X POST "http://localhost:5000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com", "password": "admin123"}'
   ```

4. **Use Admin Token**: Use the returned token in the Authorization header for all user management API calls.

## Security Notes

- User passwords are never returned in API responses
- Only users with `role: 'admin'` can access these endpoints
- All endpoints require valid JWT authentication
- Input validation is performed on all parameters
- Pagination limits prevent excessive data retrieval
