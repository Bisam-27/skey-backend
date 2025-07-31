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
    allowNull: false,
    set(value) {
      // Hash password before saving
      const hashedPassword = bcrypt.hashSync(value, 10);
      this.setDataValue('password', hashedPassword);
    }
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

module.exports = User;
