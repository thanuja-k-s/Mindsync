// Check user details
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsync');
    console.log('✅ Connected\n');

    console.log('👥 === ALL USERS ===');
    const users = await User.find();
    
    users.forEach(u => {
      console.log(`\nUser ID: ${u._id}`);
      console.log(`Username: ${u.username}`);
      console.log(`Email: ${u.email}`);
    });

    // Check the specific user
    console.log('\n\n🔍 === CHECKING SPECIFIC USER ===');
    const targetUser = await User.findById('696f16c00150793863f1ceeb');
    if (targetUser) {
      console.log(`User ${targetUser._id}:`);
      console.log(`  Username: ${targetUser.username}`);
      console.log(`  Email: ${targetUser.email}`);
    } else {
      console.log('User 696f16c00150793863f1ceeb not found');
    }

    // Check if brindha user exists
    console.log('\n🔍 === SEARCHING FOR BRINDHA USER ===');
    const brindhaUser = await User.findOne({ username: 'brindha' });
    if (brindhaUser) {
      console.log(`Found brindha user:`);
      console.log(`  ID: ${brindhaUser._id}`);
      console.log(`  Email: ${brindhaUser.email}`);
    } else {
      console.log('No user with username "brindha" found');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
