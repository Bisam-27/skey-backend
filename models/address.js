const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id'
    },
    comment: 'Reference to user table'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Address name cannot be empty'
      },
      len: {
        args: [2, 100],
        msg: 'Address name must be between 2 and 100 characters'
      }
    },
    comment: 'Address label/name (e.g., Home, Office)'
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'First name cannot be empty'
      }
    }
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Last name cannot be empty'
      }
    }
  },
  address_line_1: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Address line 1 cannot be empty'
      }
    }
  },
  address_line_2: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'City cannot be empty'
      }
    }
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'State cannot be empty'
      }
    }
  },
  postal_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Postal code cannot be empty'
      }
    }
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'India',
    validate: {
      notEmpty: {
        msg: 'Country cannot be empty'
      }
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this is the default address for the user'
  },
  type: {
    type: DataTypes.ENUM('shipping', 'billing', 'both'),
    allowNull: false,
    defaultValue: 'both',
    comment: 'Address type - shipping, billing, or both'
  }
}, {
  tableName: 'addresses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
Address.prototype.getFullName = function() {
  return `${this.first_name} ${this.last_name}`;
};

Address.prototype.getFormattedAddress = function() {
  let address = this.address_line_1;
  if (this.address_line_2) {
    address += `, ${this.address_line_2}`;
  }
  address += `, ${this.city}, ${this.state} ${this.postal_code}, ${this.country}`;
  return address;
};

// Class methods
Address.findByUserId = async function(userId) {
  return await Address.findAll({
    where: { user_id: userId },
    order: [['is_default', 'DESC'], ['created_at', 'DESC']]
  });
};

Address.findDefaultByUserId = async function(userId) {
  return await Address.findOne({
    where: { 
      user_id: userId,
      is_default: true 
    }
  });
};

module.exports = Address;
