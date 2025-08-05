const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

async function addCartCouponFields() {
  try {
    console.log('🔄 Adding coupon fields to cart table...');

    // Add applied_coupon column
    try {
      await sequelize.getQueryInterface().addColumn('cart', 'applied_coupon', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON string containing applied coupon details'
      });
      console.log('✅ Added applied_coupon column');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️ applied_coupon column already exists');
      } else {
        throw error;
      }
    }

    // Add discount_amount column
    try {
      await sequelize.getQueryInterface().addColumn('cart', 'discount_amount', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Total discount amount applied to the cart'
      });
      console.log('✅ Added discount_amount column');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️ discount_amount column already exists');
      } else {
        throw error;
      }
    }

    // Add delivery_fee column
    try {
      await sequelize.getQueryInterface().addColumn('cart', 'delivery_fee', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Delivery fee for the cart'
      });
      console.log('✅ Added delivery_fee column');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('ℹ️ delivery_fee column already exists');
      } else {
        throw error;
      }
    }

    // Update existing carts to have default values
    await sequelize.query(`
      UPDATE cart 
      SET discount_amount = 0.00, delivery_fee = 0.00 
      WHERE discount_amount IS NULL OR delivery_fee IS NULL
    `);
    console.log('✅ Updated existing cart records with default values');

    console.log('🎉 Cart table migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addCartCouponFields()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addCartCouponFields;
