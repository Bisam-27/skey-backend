const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Product name cannot be empty'
      },
      len: {
        args: [2, 255],
        msg: 'Product name must be between 2 and 255 characters'
      }
    }
  },
  brand_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  short_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Stock cannot be negative'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specification: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {

    // Matching database structure
    type: DataTypes.INTEGER, 
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Price must be greater than or equal to 0'
      }
    }
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Discount cannot be negative'
      },
      max: {
        args: [100],
        msg: 'Discount cannot exceed 100%'
      }
    }
  },
  size: {
    type: DataTypes.STRING(12),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  image_1_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  image_2_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  image_3_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  image_1_thumbnail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  image_2_thumbnail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  image_3_thumbnail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  material: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  catalogue_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  fit_type: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  sleeve_type: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  pattern: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  occassion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  img_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  img_4_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  subcategory_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: null // Remove foreign key constraint for existing table
  }
}, {

  // Using custom created_at field
  timestamps: false, 
  tableName: 'product' // Matching your database table name
});

module.exports = Product;
