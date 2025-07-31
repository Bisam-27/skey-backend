const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Feature = sequelize.define('Feature', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Feature title cannot be empty'
      },
      len: {
        args: [2, 255],
        msg: 'Feature title must be between 2 and 255 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Feature description cannot be empty'
      },
      len: {
        args: [10, 1000],
        msg: 'Feature description must be between 10 and 1000 characters'
      }
    }
  },
  icon_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to feature icon/image'
  },
  icon_class: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'CSS class for icon (if using icon fonts)'
  },
  type: {
    type: DataTypes.ENUM('why_choose_us', 'service', 'benefit'),
    allowNull: false,
    defaultValue: 'why_choose_us',
    validate: {
      isIn: {
        args: [['why_choose_us', 'service', 'benefit']],
        msg: 'Feature type must be why_choose_us, service, or benefit'
      }
    }
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Display order (lower numbers appear first)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  background_color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    comment: 'Hex color code for feature background'
  },
  text_color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    comment: 'Hex color code for feature text'
  }
}, {
  tableName: 'features',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['type', 'is_active', 'position']
    }
  ]
});

module.exports = Feature;
