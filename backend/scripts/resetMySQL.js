require('dotenv').config();
const { query } = require('../config/mysql');

async function resetDatabase() {
  try {
    console.log('⚠️  WARNING: This will delete ALL data from the database!\n');
    
    // Check if tables exist first
    const tables = await query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('✗ No tables found in database!');
      console.log('\nAction required:');
      console.log('1. Import backend/database/schema.sql first');
      console.log('2. You can import via phpMyAdmin or command line:');
      console.log('   mysql -u root -p food_ordering < backend/database/schema.sql');
      console.log('\nAfter importing schema, run: npm run seed');
      process.exit(1);
    }
    
    console.log(`Found ${tables.length} tables in database\n`);
    
    // Disable foreign key checks
    await query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Disabled foreign key checks...');
    
    // Truncate tables and reset AUTO_INCREMENT
    console.log('\nTruncating tables and resetting AUTO_INCREMENT...');
    
    const tableNames = ['order_items', 'orders', 'menu_items', 'users'];
    let cleared = 0;
    
    for (const tableName of tableNames) {
      try {
        // Delete all data
        await query(`DELETE FROM ${tableName}`);
        // Reset AUTO_INCREMENT to 1
        await query(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
        console.log(`✓ Cleared ${tableName} and reset ID counter`);
        cleared++;
      } catch (error) {
        console.log(`⊘ Skipped ${tableName} (doesn't exist)`);
      }
    }
    
    // Re-enable foreign key checks
    await query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\nRe-enabled foreign key checks...');
    
    if (cleared === 0) {
      console.log('\n✗ No tables were cleared!');
      console.log('\nPlease import schema.sql first.');
      process.exit(1);
    }
    
    console.log(`\n✓ Database reset successfully! (${cleared} tables cleared)`);
    console.log('✓ AUTO_INCREMENT counters reset to 1');
    console.log('\nYou can now run: npm run seed');
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error resetting database:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure MySQL is running in XAMPP');
    console.error('2. Verify database "food_ordering" exists');
    console.error('3. Import schema.sql if tables are missing');
    console.error('4. Check .env has correct database credentials');
    process.exit(1);
  }
}

// Confirm before running
console.log('═══════════════════════════════════════════════════════');
console.log('  DATABASE RESET UTILITY');
console.log('═══════════════════════════════════════════════════════');
console.log('\nThis will DELETE ALL DATA from:');
console.log('  - users');
console.log('  - menu_items');
console.log('  - orders');
console.log('  - order_items');
console.log('\nPress Ctrl+C to cancel, or wait 3 seconds to continue...\n');

setTimeout(resetDatabase, 3000);
