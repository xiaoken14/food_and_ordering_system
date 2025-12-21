require('dotenv').config();
const MenuItem = require('../models/MenuItem');

const sampleMenuItems = [
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan cheese and croutons',
    price: 8.99,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'
  },
  {
    name: 'Chicken Wings',
    description: 'Crispy wings with your choice of sauce',
    price: 12.99,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400'
  },
  {
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with vegetables and rice',
    price: 24.99,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'
  },
  {
    name: 'Beef Burger',
    description: 'Juicy beef patty with cheese, lettuce, and tomato',
    price: 15.99,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
  },
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
    price: 18.99,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'
  },
  {
    name: 'Pasta Carbonara',
    description: 'Creamy pasta with bacon and parmesan',
    price: 16.99,
    category: 'main',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400'
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with chocolate frosting',
    price: 7.99,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'
  },
  {
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee and mascarpone',
    price: 8.99,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400'
  },
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 4.99,
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'
  },
  {
    name: 'Iced Coffee',
    description: 'Cold brew coffee with ice',
    price: 5.99,
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400'
  },
  {
    name: 'Cheesecake',
    description: 'New York style cheesecake with berry compote',
    price: 8.50,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400'
  },
  {
    name: 'Lemonade',
    description: 'Homemade fresh lemonade',
    price: 4.00,
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'
  }
];

const seedMenu = async () => {
  try {
    console.log('Seeding menu items to DynamoDB...\n');

    for (const item of sampleMenuItems) {
      await MenuItem.create(item);
      console.log(`✓ Added: ${item.name}`);
    }

    console.log(`\n✓ Successfully added ${sampleMenuItems.length} menu items!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedMenu();
