const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Banner = sequelize.define('Banner', {
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
        msg: 'Banner title cannot be empty'
      },
      len: {
        args: [2, 255],
        msg: 'Banner title must be between 2 and 255 characters'
      }
    }
  },
  subtitle: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true, // Changed to allow null for announcements
    validate: {
      // Custom validation to require image_url for hero and promotional banners
      customImageValidation(value) {
        if ((this.type === 'hero' || this.type === 'promotional') && !value) {
          throw new Error('Image URL is required for hero and promotional banners');
        }
      }
    }
  },
  mobile_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Optional mobile-specific image'
  },
  link_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to redirect when banner is clicked'
  },
  link_text: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Text for the call-to-action button'
  },
  type: {
    type: DataTypes.ENUM('hero', 'promotional', 'announcement'),
    allowNull: false,
    defaultValue: 'hero',
    validate: {
      isIn: {
        args: [['hero', 'promotional', 'announcement']],
        msg: 'Banner type must be hero, promotional, or announcement'
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
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When banner should start showing'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When banner should stop showing'
  },
  background_color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    comment: 'Hex color code for banner background'
  },
  text_color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    comment: 'Hex color code for banner text'
  }
}, {
  tableName: 'banners',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['type', 'is_active', 'position']
    },
    {
      fields: ['start_date', 'end_date']
    }
  ]
});

// Instance method to check if banner is currently active
Banner.prototype.isCurrentlyActive = function() {
  if (!this.is_active) return false;
  
  const now = new Date();
  
  // Check start date
  if (this.start_date && now < this.start_date) return false;
  
  // Check end date
  if (this.end_date && now > this.end_date) return false;
  
  return true;
};

module.exports = Banner;
