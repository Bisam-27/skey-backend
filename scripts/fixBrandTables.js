require('dotenv').config();
const sequelize = require('../config/db');
const Brand = require('../models/brand');

const fixBrandTables = async () => {
  try {
    console.log('🔧 Fixing brand table structure...\n');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check what brand-related tables exist
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME LIKE '%brand%'
      ORDER BY TABLE_NAME
    `);

    console.log('📋 Found brand-related tables:');
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.TABLE_NAME}`);
    });

    // Check if both 'brand' and 'brands' tables exist
    const hasBrandSingular = tables.some(t => t.TABLE_NAME === 'brand');
    const hasBrandsPlural = tables.some(t => t.TABLE_NAME === 'brands');

    if (hasBrandSingular && hasBrandsPlural) {
      console.log('\n⚠️ Both "brand" and "brands" tables exist - need to consolidate');
      
      // Get data from both tables
      const [brandData] = await sequelize.query('SELECT * FROM brand ORDER BY id');
      const [brandsData] = await sequelize.query('SELECT * FROM brands ORDER BY id');
      
      console.log(`📊 Data count - brand: ${brandData.length}, brands: ${brandsData.length}`);
      
      if (brandData.length > 0 && brandsData.length === 0) {
        console.log('🔄 Migrating data from "brand" to "brands" table...');
        
        // Migrate data from brand to brands
        for (const brand of brandData) {
          await sequelize.query(`
            INSERT INTO brands (id, name, slug, description, logo_url, website_url, is_active, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, {
            replacements: [
              brand.id,
              brand.name,
              brand.slug || brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              brand.description,
              brand.logo_url,
              brand.website_url,
              brand.is_active !== undefined ? brand.is_active : true,
              brand.sort_order || 0,
              brand.created_at || new Date(),
              brand.updated_at || new Date()
            ]
          });
        }
        
        console.log('✅ Data migrated successfully');
      }
      
      // Drop the singular 'brand' table
      console.log('🗑️ Dropping "brand" table (singular)...');
      await sequelize.query('DROP TABLE IF EXISTS brand');
      console.log('✅ "brand" table dropped');
      
    } else if (hasBrandSingular && !hasBrandsPlural) {
      console.log('\n🔄 Renaming "brand" table to "brands"...');
      await sequelize.query('RENAME TABLE brand TO brands');
      console.log('✅ Table renamed successfully');
      
    } else if (!hasBrandSingular && hasBrandsPlural) {
      console.log('\n✅ Correct setup: Only "brands" table exists');
      
    } else {
      console.log('\n❌ No brand tables found - creating "brands" table...');
    }

    // Ensure the brands table has the correct structure
    console.log('\n🔄 Syncing Brand model with database...');
    await Brand.sync({ alter: true });
    console.log('✅ Brand model synced');

    // Verify final structure
    const [finalTables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME LIKE '%brand%'
      ORDER BY TABLE_NAME
    `);

    console.log('\n📋 Final brand tables:');
    finalTables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.TABLE_NAME}`);
    });

    // Check final data
    const [finalBrands] = await sequelize.query('SELECT id, name, slug, is_active FROM brands ORDER BY id');
    console.log(`\n📦 Final brands data (${finalBrands.length} records):`);
    if (finalBrands.length === 0) {
      console.log('  (empty - run add-sample-brands.bat to add sample data)');
    } else {
      finalBrands.forEach((brand, index) => {
        console.log(`  ${index + 1}. ID: ${brand.id}, Name: "${brand.name}", Active: ${brand.is_active}`);
      });
    }

    console.log('\n🎉 Brand table structure fixed successfully!');
    console.log('✅ Using single "brands" table (plural) with Brand model');
    console.log('✅ All vendor operations will use this table');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing brand tables:', error);
    process.exit(1);
  }
};

fixBrandTables();
