const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true, // Allow null for Google OAuth users
    set(value) {
      // Only hash password if value is provided
      if (value) {
        const hashedPassword = bcrypt.hashSync(value, 10);
        this.setDataValue('password', hashedPassword);
      }
    }
  },
  googleId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'vendor'),
    allowNull: false,
    defaultValue: 'user',
    validate: {
      isIn: {
        args: [['user', 'admin', 'vendor']],
        msg: 'Role must be either user, admin, or vendor'
      }
    }
  }
}, {
  tableName: 'user',
  timestamps: false, // Disable timestamps since the existing table doesn't have them
  hooks: {
    beforeCreate: async (user) => {
      // Additional validation or processing can be done here
    }
  }
});

// Instance method to compare passwords
User.prototype.comparePassword = function(candidatePassword) {
  // Return false if user doesn't have a password (Google OAuth user)
  if (!this.password) {
    return false;
  }
  return bcrypt.compareSync(candidatePassword, this.password);
};

// Instance method to check if user is admin
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

// Instance method to check if user is vendor
User.prototype.isVendor = function() {
  return this.role === 'vendor';
};

// Class method to find user by email
User.findByEmail = async function(email) {
  return await User.findOne({ where: { email } });
};

// Class method to find user by Google ID
User.findByGoogleId = async function(googleId) {
  return await User.findOne({ where: { googleId } });
};

// Define associations here to avoid circular dependency issues
User.associate = function(models) {
  // User has one VendorProfile (for vendors only)
  User.hasOne(models.VendorProfile, {
    foreignKey: 'user_id',
    as: 'vendorProfile'
  });
};

module.exports = User;
