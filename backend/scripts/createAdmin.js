require('dotenv').config();
const User = require('../models/User');

const createAdmin = async () => {
  try {
    const email = process.argv[2];
    if (!email) {
      console.log('Usage: node scripts/createAdmin.js <email>');
      process.exit(1);
    }

    const user = await User.findByEmail(email);
    if (!user) {
      console.log('User not found with email:', email);
      process.exit(1);
    }

    await User.updateRole(user.id, 'admin');

    console.log('\n✓ User updated to admin successfully!');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
