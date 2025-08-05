const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VendorProfile = sequelize.define('VendorProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: 'Reference to user table - one-to-one relationship'
  },
  business_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Business name cannot be empty'
      },
      len: {
        args: [2, 255],
        msg: 'Business name must be between 2 and 255 characters'
      }
    }
  },
  contact_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Contact name cannot be empty'
      },
      len: {
        args: [2, 255],
        msg: 'Contact name must be between 2 and 255 characters'
      }
    }
  },
  mobile_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Mobile number cannot be empty'
      },
      len: {
        args: [10, 20],
        msg: 'Mobile number must be between 10 and 20 characters'
      }
    }
  },
  gst_number: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: {
      len: {
        args: [0, 15],
        msg: 'GST number cannot exceed 15 characters'
      }
    }
  },
  business_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bank_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: {
        args: [0, 255],
        msg: 'Bank name cannot exceed 255 characters'
      }
    }
  },
  pan_number: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      len: {
        args: [0, 10],
        msg: 'PAN number cannot exceed 10 characters'
      }
    }
  },
  business_license_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to uploaded business license document'
  },
  gst_certificate_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to uploaded GST certificate document'
  },
  cancelled_cheque_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to uploaded cancelled cheque document'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether the vendor profile has been verified by admin'
  },
  verification_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Admin notes about verification status'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'vendor_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeUpdate: (vendorProfile) => {
      vendorProfile.updated_at = new Date();
    }
  }
});

// Define associations here to avoid circular dependency issues
VendorProfile.associate = function(models) {
  // VendorProfile belongs to User
  VendorProfile.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

module.exports = VendorProfile;
