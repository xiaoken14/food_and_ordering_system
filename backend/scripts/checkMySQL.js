require('dotenv').config();
const { query } = require('../config/mysql');

async function checkDatabase() {
  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  DATABASE STATUS CHECK');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Check connection
    console.log('Checking MySQL connection...');
    await query('SELECT 1');
    console.log('✓ MySQL connection successful\n');
    
    // Check database
    const dbName = process.env.DB_NAME || 'food_ordering';
    console.log(`Checking database: ${dbName}`);
    const dbCheck = await query('SELECT DATABASE() as db');
    console.log(`✓ Connected to database: ${dbCheck[0].db}\n`);
    
    // Check tables
    console.log('Checking tables...');
    const tables = await query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('✗ No tables found!');
      console.log('\nAction required:');
      console.log('1. Import backend/database/schema.sql in phpMyAdmin');
      console.log('2. Or run the SQL file manually');
      process.exit(1);
    }
    
    console.log(`✓ Found ${tables.length} tables:\n`);
    
    // Count records in each table
    const tableNames = ['users', 'menu_items', 'orders', 'order_items'];
    
    for (const tableName of tableNames) {
      try {
        const count = await query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const recordCount = count[0].count;
        const status = recordCount > 0 ? '✓' : '○';
        console.log(`  ${status} ${tableName}: ${recordCount} records`);
      } catch (error) {
        console.log(`  ✗ ${tableName}: Table not found`);
      }
    }
    
    // Check for admin user
    console.log('\nChecking for admin user...');
    const admins = await query("SELECT email, name FROM users WHERE role = 'admin'");
    
    if (admins.length === 0) {
      console.log('○ No admin users found');
      console.log('\nTo create admin:');
      console.log('1. Register a user through the app');
      console.log('2. Run: npm run create-admin [email]');
    } else {
      console.log(`✓ Found ${admins.length} admin user(s):`);
      admins.forEach(admin => {
        console.log(`  - ${admin.name} (${admin.email})`);
      });
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  DATABASE STATUS: OK');
    console.log('═══════════════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error checking database:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure MySQL is running in XAMPP');
    console.error('2. Verify database "food_ordering" exists');
    console.error('3. Check .env has correct database credentials');
    console.error('4. Import schema.sql if tables are missing');
    process.exit(1);
  }
}

checkDatabase();
