// Load environment variables from backend directory
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mysql = require('mysql2/promise');

const testConnection = async () => {
  console.log('🔍 Testing MySQL Connection...\n');
  
  // Show what credentials we're using
  console.log('📋 Database Configuration:');
  console.log(`   Host: ${process.env.DB_HOST || 'undefined'}`);
  console.log(`   User: ${process.env.DB_USER || 'undefined'}`);
  console.log(`   Password: ${process.env.DB_PASSWORD ? '[SET]' : '[EMPTY]'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'undefined'}`);
  console.log('');

  try {
    // Test connection without database first
    console.log('1️⃣ Testing MySQL server connection...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    console.log('✅ MySQL server connection successful');
    
    // Check if database exists
    console.log('2️⃣ Checking if database exists...');
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === process.env.DB_NAME);
    
    if (dbExists) {
      console.log(`✅ Database '${process.env.DB_NAME}' exists`);
    } else {
      console.log(`❌ Database '${process.env.DB_NAME}' does not exist`);
      console.log('💡 Creating database...');
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
      console.log(`✅ Database '${process.env.DB_NAME}' created`);
    }
    
    // Test connection with database
    console.log('3️⃣ Testing connection to specific database...');
    await connection.changeUser({ database: process.env.DB_NAME });
    console.log('✅ Database connection successful');
    
    // Check if user table exists
    console.log('4️⃣ Checking if user table exists...');
    try {
      const [tables] = await connection.execute('SHOW TABLES LIKE "user"');
      if (tables.length > 0) {
        console.log('✅ User table exists');
        
        // Check table structure
        const [columns] = await connection.execute('DESCRIBE user');
        console.log('📋 User table structure:');
        columns.forEach(col => {
          console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(required)' : '(optional)'}`);
        });
        
        // Check if role column exists
        const hasRole = columns.some(col => col.Field === 'role');
        if (hasRole) {
          console.log('✅ Role column exists');
        } else {
          console.log('❌ Role column missing - this is likely the cause of your login issue');
        }
      } else {
        console.log('❌ User table does not exist');
      }
    } catch (error) {
      console.log('❌ Error checking user table:', error.message);
    }
    
    await connection.end();
    
    console.log('\n🎯 SUMMARY:');
    console.log('   - MySQL server: ✅ Working');
    console.log(`   - Database '${process.env.DB_NAME}': ✅ Accessible`);
    console.log('   - Next step: Run the fix script to ensure user table has role column');
    console.log('\n🚀 Run: node backend/scripts/fixDatabase.js');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 SOLUTIONS:');
      console.log('1. Check if MySQL server is running');
      console.log('2. Verify your MySQL root password');
      console.log('3. If you have a password, update the .env file');
      console.log('4. Try connecting with MySQL Workbench or command line first');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUTIONS:');
      console.log('1. Start your MySQL server');
      console.log('2. Check if MySQL is running on port 3306');
      console.log('3. Verify MySQL is installed');
    }
  }
};

testConnection();
