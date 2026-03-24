const mongoose = require('mongoose');
const Entry = require('./models/Entry');
const User = require('./models/User');

async function checkEntries() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');
    console.log('Connected to MongoDB');

    // Find brindha user
    const user = await User.findOne({ username: 'brindha' });
    const userId = user._id;
    console.log(`User ID: ${userId}`);

    // Get actual journal entries
    const entries = await Entry.find({ userId }).lean();
    console.log(`\nFound ${entries.length} journal entries for brindha`);
    
    if (entries.length === 0) {
      console.log('No entries found!');
      await mongoose.disconnect();
      return;
    }

    // Show all entries
    entries.forEach((entry, i) => {
      console.log(`\n${i + 1}. Created: ${entry.createdAt}`);
      const text = entry.content || entry.text || '';
      console.log(`   Text: "${text.substring(0, 80)}"`);
      if (text.includes('marriage')) console.log('   ✓ Contains "marriage"');
      if (text.includes('gym')) console.log('   ✓ Contains "gym"');
      if (text.includes('temple')) console.log('   ✓ Contains "temple"');
      if (text.includes('beach')) console.log('   ✓ Contains "beach"');
    });

    console.log('\n--- Checking for marriage entry ---');
    const marriageEntry = entries.find(e => {
      const text = e.content || e.text || '';
      return text.toLowerCase().includes('marriage');
    });
    if (marriageEntry) {
      console.log('Found marriage entry:');
      console.log(`Text: "${marriageEntry.content || marriageEntry.text}"`);
    } else {
      console.log('NO MARRIAGE ENTRY FOUND');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEntries();
