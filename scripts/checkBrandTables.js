require('dotenv').config();
const sequelize = require('../config/db');

const checkBrandTables = async () => {
  try {
    console.log('🔍 Checking brand table structure...\n');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check what brand-related tables exist
    console.log('📋 Checking existing tables...');
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME LIKE '%brand%'
      ORDER BY TABLE_NAME
    `);

    if (tables.length === 0) {
      console.log('❌ No brand tables found');
    } else {
      console.log('📊 Found brand-related tables:');
      tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table.TABLE_NAME}`);
      });
    }

    console.log('\n🔍 Checking table structures...');

    // Check if 'brands' table exists and its structure
    try {
      const [brandsStructure] = await sequelize.query(`
        DESCRIBE brands
      `);
      
      console.log('\n✅ "brands" table structure:');
      brandsStructure.forEach(column => {
        console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''}`);
      });

      // Check data in brands table
      const [brandsData] = await sequelize.query(`
        SELECT id, name, slug, is_active, created_at 
        FROM brands 
        ORDER BY id
      `);

      console.log(`\n📦 Data in "brands" table (${brandsData.length} records):`);
      if (brandsData.length === 0) {
        console.log('  (empty)');
      } else {
        brandsData.forEach((brand, index) => {
          console.log(`  ${index + 1}. ID: ${brand.id}, Name: "${brand.name}", Slug: "${brand.slug}", Active: ${brand.is_active}`);
        });
      }

    } catch (error) {
      console.log('❌ "brands" table does not exist or error accessing it:', error.message);
    }

    // Check if 'brand' table exists (singular)
    try {
      const [brandStructure] = await sequelize.query(`
        DESCRIBE brand
      `);
      
      console.log('\n⚠️ "brand" table (singular) also exists:');
      brandStructure.forEach(column => {
        console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? `(${column.Key})` : ''}`);
      });

      // Check data in brand table
      const [brandData] = await sequelize.query(`
        SELECT * FROM brand ORDER BY id
      `);

      console.log(`\n📦 Data in "brand" table (${brandData.length} records):`);
      if (brandData.length === 0) {
        console.log('  (empty)');
      } else {
        brandData.forEach((brand, index) => {
          console.log(`  ${index + 1}. ${JSON.stringify(brand)}`);
        });
      }

    } catch (error) {
      console.log('\n✅ "brand" table (singular) does not exist - this is correct');
    }

    // Check products table for brand_id references
    try {
      const [productBrands] = await sequelize.query(`
        SELECT DISTINCT brand_id, COUNT(*) as product_count
        FROM products 
        WHERE brand_id IS NOT NULL
        GROUP BY brand_id
        ORDER BY brand_id
      `);

      console.log(`\n🔗 Products referencing brands (${productBrands.length} different brand IDs):`);
      if (productBrands.length === 0) {
        console.log('  (no products have brand_id set)');
      } else {
        productBrands.forEach((ref, index) => {
          console.log(`  ${index + 1}. Brand ID: ${ref.brand_id}, Products: ${ref.product_count}`);
        });
      }

    } catch (error) {
      console.log('\n❌ Error checking product brand references:', error.message);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('='.repeat(50));
    console.log('✅ Correct setup: Use "brands" table (plural) with Brand model');
    console.log('✅ Products reference brands via brand_id foreign key');
    console.log('✅ All controllers and routes should use Brand model -> brands table');
    
    if (tables.some(t => t.TABLE_NAME === 'brand')) {
      console.log('⚠️  WARNING: Found "brand" table (singular) - this should be removed');
      console.log('   Only "brands" table (plural) should exist');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking brand tables:', error);
    process.exit(1);
  }
};

checkBrandTables();
