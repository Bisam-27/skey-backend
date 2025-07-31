const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Subcategory = sequelize.define('Subcategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Subcategory name cannot be empty'
      },
      len: {
        args: [2, 100],
        msg: 'Subcategory name must be between 2 and 100 characters'
      }
    }
  },
  short_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Subcategory short_name cannot be empty'
      }
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  img_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'subcategory', // Changed to match the foreign key constraint
  timestamps: false, // The subcategory table doesn't have timestamps
  indexes: [
    {
      unique: true,
      fields: ['category_id', 'short_name'] // Changed to match actual table structure
    }
  ]
});

module.exports = Subcategory;
