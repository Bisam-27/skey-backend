const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Testimonial = sequelize.define('Testimonial', {
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
        msg: 'Customer name cannot be empty'
      },
      len: {
        args: [2, 255],
        msg: 'Customer name must be between 2 and 255 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email address'
      }
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: {
      min: {
        args: [1],
        msg: 'Rating must be at least 1'
      },
      max: {
        args: [5],
        msg: 'Rating cannot exceed 5'
      }
    }
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Review text cannot be empty'
      },
      len: {
        args: [10, 2000],
        msg: 'Review must be between 10 and 2000 characters'
      }
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Product this review is for (optional)'
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Customer photo or product image'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Customer location (city, state)'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether to show on homepage'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether the review is verified'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Display order for featured testimonials'
  }
}, {
  tableName: 'testimonials',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['is_featured', 'is_active', 'position']
    },
    {
      fields: ['rating', 'is_verified']
    },
    {
      fields: ['product_id']
    }
  ]
});

module.exports = Testimonial;
