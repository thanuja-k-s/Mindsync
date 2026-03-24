const mongoose = require('mongoose');
const Entry = require('./models/Entry');
const User = require('./models/User');

async function debugEntries() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');

    const user = await User.findOne({ username: 'brindha' });
    const userId = user._id;

    const entries = await Entry.find({ userId }).lean().limit(3);
    console.log(`Found ${entries.length} entries`);

    entries.forEach((entry, i) => {
      console.log(`\nEntry ${i + 1}:`);
      console.log(`  Keys: ${Object.keys(entry).join(', ')}`);
      console.log(`  content: ${entry.content ? entry.content.substring(0, 50) : 'undefined'}`);
      console.log(`  text: ${entry.text ? entry.text.substring(0, 50) : 'undefined'}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugEntries();
