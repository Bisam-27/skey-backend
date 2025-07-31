const sequelize = require('../config/db');
const { Coupon, CouponUsage } = require('../models/associations');

async function createCouponTables() {
  try {
    console.log('🔄 Creating coupon tables...');

    // Create coupons table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        vendor_id INT NOT NULL,
        product_type ENUM('collection', 'product') NOT NULL,
        collection_id INT NULL,
        product_id INT NULL,
        coupon_type ENUM('discount', 'flat_off') NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        expiration_date DATE NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        usage_limit INT NULL,
        used_count INT NOT NULL DEFAULT 0,
        minimum_order_amount DECIMAL(10,2) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_vendor_id (vendor_id),
        INDEX idx_code (code),
        INDEX idx_expiration_date (expiration_date),
        INDEX idx_is_active (is_active),
        FOREIGN KEY (vendor_id) REFERENCES user(id) ON DELETE CASCADE,
        FOREIGN KEY (collection_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Coupons table created successfully');

    // Create coupon_usage table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS coupon_usage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        coupon_id INT NOT NULL,
        user_id INT NOT NULL,
        order_id INT NULL,
        discount_amount DECIMAL(10,2) NOT NULL,
        order_amount DECIMAL(10,2) NOT NULL,
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_coupon_id (coupon_id),
        INDEX idx_user_id (user_id),
        INDEX idx_used_at (used_at),
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Coupon usage table created successfully');

    // Sync models to ensure they match the database structure
    await Coupon.sync({ alter: true });
    await CouponUsage.sync({ alter: true });

    console.log('✅ All coupon tables created and synced successfully!');
    console.log('');
    console.log('📋 Tables created:');
    console.log('  - coupons: Store coupon information');
    console.log('  - coupon_usage: Track coupon usage history');
    console.log('');
    console.log('🔗 API Endpoints available:');
    console.log('  POST   /api/coupons - Create new coupon (vendor)');
    console.log('  GET    /api/coupons/vendor/coupons - Get vendor coupons');
    console.log('  GET    /api/coupons/vendor/products - Get vendor products');
    console.log('  GET    /api/coupons/collections - Get collections');
    console.log('  GET    /api/coupons/:id - Get coupon details');
    console.log('  PUT    /api/coupons/:id - Update coupon');
    console.log('  DELETE /api/coupons/:id - Delete coupon');
    console.log('  POST   /api/coupons/validate - Validate coupon (customer)');

  } catch (error) {
    console.error('❌ Error creating coupon tables:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  createCouponTables()
    .then(() => {
      console.log('🎉 Coupon system setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = createCouponTables;
