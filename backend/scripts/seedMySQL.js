require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('../config/mysql');

const sampleUsers = [
  {
    email: 'admin@gmail.com',
    name: 'Admin User',
    password: '123456',
    role: 'admin',
    phone: '555-0001',
    address: '123 Admin Street, City, State 12345'
  },
  {
    email: 'staff@gmail.com',
    name: 'Staff Member',
    password: '123456',
    role: 'staff',
    phone: '555-0002',
    address: '456 Staff Avenue, City, State 12345'
  },
  {
    email: 'johndoe@gmail.com',
    name: 'John Doe',
    password: '123456',
    role: 'customer',
    phone: '555-0003',
    address: '789 Customer Lane, City, State 12345'
  },
  {
    email: 'janesmith@gmail.com',
    name: 'Jane Smith',
    password: '123456',
    role: 'customer',
    phone: '555-0004',
    address: '553 Maple Avenue, Springfield, IL 62704'
  }
];

const sampleMenuItems = [
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan cheese and croutons',
    price: 38.50,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'
  },
  {
    name: 'Chicken Wings',
    description: 'Crispy wings with your choice of sauce',
    price: 55.00,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400'
  },
  {
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with vegetables and rice',
    price: 105.00,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'
  },
  {
    name: 'Beef Burger',
    description: 'Juicy beef patty with cheese, lettuce, and tomato',
    price: 68.00,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
  },
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
    price: 80.00,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'
  },
  {
    name: 'Pasta Carbonara',
    description: 'Creamy pasta with bacon and parmesan',
    price: 72.00,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400'
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with chocolate frosting',
    price: 34.00,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
  },
  {
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee and mascarpone',
    price: 38.00,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400'
  },
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 21.00,
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'
  },
  {
    name: 'Iced Coffee',
    description: 'Cold brew coffee with ice',
    price: 25.00,
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400'
  },
  {
    name: 'Cheesecake',
    description: 'New York style cheesecake with berry compote',
    price: 36.00,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400'
  },
  {
    name: 'Lemonade',
    description: 'Homemade fresh lemonade',
    price: 17.00,
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'
  }
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');

    // Seed users
    console.log('Seeding users...');
    let usersCreated = 0;
    let usersSkipped = 0;
    
    for (const user of sampleUsers) {
      try {
        // Check if user already exists
        const checkSql = 'SELECT id FROM users WHERE email = ?';
        const existing = await query(checkSql, [user.email]);
        
        if (existing.length > 0) {
          console.log(`⊘ Skipped ${user.role}: ${user.email} (already exists)`);
          usersSkipped++;
          continue;
        }
        
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        const sql = `
          INSERT INTO users (email, name, password, role, phone, address)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const result = await query(sql, [
          user.email,
          user.name,
          hashedPassword,
          user.role,
          user.phone,
          user.address
        ]);
        
        console.log(`✓ Created ${user.role}: ${user.email} (password: 123456)`);
        usersCreated++;
      } catch (error) {
        console.log(`✗ Failed to create ${user.email}: ${error.message}`);
      }
    }

    // Seed menu items
    console.log('\nSeeding menu items...');
    let itemsCreated = 0;
    let itemsSkipped = 0;
    
    for (const item of sampleMenuItems) {
      try {
        // Check if item already exists
        const checkSql = 'SELECT id FROM menu_items WHERE name = ?';
        const existing = await query(checkSql, [item.name]);
        
        if (existing.length > 0) {
          console.log(`⊘ Skipped: ${item.name} (already exists)`);
          itemsSkipped++;
          continue;
        }
        
        const sql = `
          INSERT INTO menu_items (name, description, price, category, image, available)
          VALUES (?, ?, ?, ?, ?, TRUE)
        `;
        
        const result = await query(sql, [
          item.name,
          item.description,
          item.price,
          item.category,
          item.image
        ]);
        
        console.log(`✓ Added: ${item.name} ($${item.price})`);
        itemsCreated++;
      } catch (error) {
        console.log(`✗ Failed to create ${item.name}: ${error.message}`);
      }
    }

    console.log('\n✓ Database seeding completed!');
    console.log('\nSummary:');
    console.log(`- Users: ${usersCreated} created, ${usersSkipped} skipped`);
    console.log(`- Menu items: ${itemsCreated} created, ${itemsSkipped} skipped`);
    
    if (usersCreated > 0) {
      console.log('\nDefault Accounts (password: 123456):');
      console.log('- Admin: admin@gmail.com');
      console.log('- Staff: staff@gmail.com');
      console.log('- Customer: johndoe@gmail.com, janesmith@gmail.com');
    }
    
    if (usersSkipped > 0 || itemsSkipped > 0) {
      console.log('\nNote: Some items were skipped because they already exist.');
      console.log('To reset the database, delete existing records first.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error seeding database:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure MySQL is running in XAMPP');
    console.error('2. Verify database "food_ordering" exists');
    console.error('3. Check that schema.sql has been imported');
    console.error('4. Verify .env has correct database credentials');
    process.exit(1);
  }
}

seedDatabase();
