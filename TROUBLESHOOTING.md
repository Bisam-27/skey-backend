# Troubleshooting User Management Setup

## Problem: Login Error "Invalid email or password" for Admin User

This error occurs because the `role` field was added to the User model but doesn't exist in your database table yet.

## Solution Steps:

### Step 1: Run the Migration Script
```bash
node backend/scripts/migrateUserRole.js
```

If this fails, try Step 2.

### Step 2: Run the Admin User Creation Script
```bash
node backend/scripts/createAdminUser.js
```

### Step 3: Manual Database Fix (if scripts fail)

If the scripts don't work, you can manually add the role column to your database:

#### Option A: Using MySQL Command Line
```sql
-- Connect to your MySQL database
USE your_database_name;

-- Add the role column
ALTER TABLE user ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user';

-- Create or update admin user
INSERT INTO user (email, password, role) 
VALUES ('admin@example.com', '$2a$10$hash_here', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';
```

#### Option B: Using a Database GUI Tool (phpMyAdmin, MySQL Workbench, etc.)
1. Open your database
2. Find the `user` table
3. Add a new column:
   - Name: `role`
   - Type: `ENUM('user', 'admin')`
   - Default: `user`
   - Not Null: Yes
4. Find or create a user with email `admin@example.com`
5. Set their role to `admin`

### Step 4: Verify the Fix

After running any of the above solutions, test the login:

```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

You should get a successful response with the user's role included.

## Common Issues:

### Issue 1: "Unknown column 'role'"
**Solution**: The role column doesn't exist. Run the migration script or add it manually.

### Issue 2: "Access denied for user"
**Solution**: Check your database credentials in the `.env` file.

### Issue 3: "connect ECONNREFUSED"
**Solution**: Make sure your MySQL server is running.

### Issue 4: "Table 'user' doesn't exist"
**Solution**: Make sure you've run your initial database setup/migrations.

## Alternative: Reset and Recreate

If nothing works, you can reset the user table:

```sql
-- Backup existing users first!
CREATE TABLE user_backup AS SELECT * FROM user;

-- Drop and recreate the user table
DROP TABLE user;

-- Then restart your server - Sequelize will recreate the table with the role field
```

## Verification Commands:

Check if the role column exists:
```sql
DESCRIBE user;
```

Check current users and their roles:
```sql
SELECT id, email, role FROM user;
```

## Need Help?

If you're still having issues:
1. Check your server logs for detailed error messages
2. Verify your database connection is working
3. Make sure your `.env` file has correct database credentials
4. Try restarting your server after making database changes
