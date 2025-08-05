const sequelize = require('../config/db');

async function addGoogleOAuthFields() {
  try {
    console.log('Adding Google OAuth fields to User table...');
    
    // Add googleId column
    await sequelize.query(`
      ALTER TABLE user 
      ADD COLUMN googleId VARCHAR(255) NULL UNIQUE,
      ADD COLUMN name VARCHAR(255) NULL,
      ADD COLUMN profilePicture TEXT NULL
    `);
    
    // Make password nullable for Google OAuth users
    await sequelize.query(`
      ALTER TABLE user 
      MODIFY COLUMN password VARCHAR(255) NULL
    `);
    
    console.log('Google OAuth fields added successfully!');
    console.log('- googleId: VARCHAR(255) NULL UNIQUE');
    console.log('- name: VARCHAR(255) NULL');
    console.log('- profilePicture: TEXT NULL');
    console.log('- password: Modified to allow NULL values');
    
  } catch (error) {
    console.error('Error adding Google OAuth fields:', error);
    
    // Check if columns already exist
    if (error.message.includes('Duplicate column name')) {
      console.log('Google OAuth fields already exist in the database.');
    } else {
      throw error;
    }
  } finally {
    await sequelize.close();
  }
}

// Run the migration
addGoogleOAuthFields();
