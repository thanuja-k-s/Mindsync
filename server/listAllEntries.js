const mongoose = require('mongoose');
const Entry = require('./models/Entry');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MindSync');
    
    const userId = '696f16c00150793863f1ceeb';
    const allEntries = await Entry.find({ userId });
    
    console.log(`Total entries for user ${userId}: ${allEntries.length}`);
    
    if (allEntries.length > 0) {
      console.log('\n=== ALL ENTRIES ===\n');
      allEntries.forEach((e, i) => {
        console.log(`${i+1}. "${e.content}"`);
        console.log('   Includes "marriage":', e.content.toLowerCase().includes('marriage'));
        console.log('   Includes "kavya":', e.content.toLowerCase().includes('kavya'));
        console.log('---');
      });
    }
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
