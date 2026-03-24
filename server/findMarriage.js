const mongoose = require('mongoose');
const Entry = require('./models/Entry');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');
    
    const userId = '696f16c00150793863f1ceeb';
    
    // Find all entries for this user
    const entries = await Entry.find({ userId });
    console.log(`Total entries for user: ${entries.length}`);
    
    // Find entries with marriage keywords
    const marriageEntries = entries.filter(e => 
      e.content.toLowerCase().includes('marriage') || 
      e.content.toLowerCase().includes('wedding') ||
      e.content.toLowerCase().includes('ram')
    );
    
    console.log(`\nEntries with marriage/wedding/ram: ${marriageEntries.length}`);
    
    if (marriageEntries.length > 0) {
      console.log('\n=== MARRIAGE ENTRY ===');
      const entry = marriageEntries[0];
      console.log('Content:', entry.content);
      console.log('\nAnalysis:');
      const text = entry.content.toLowerCase();
      console.log('  Contains "kavya":', text.includes('kavya'));
      console.log('  Contains "ram":', text.includes('ram'));
      console.log('  Contains "non veg":', text.includes('non veg'));
      console.log('  Contains "enjoyed":', text.includes('enjoyed'));
      console.log('  Contains "meal":', text.includes('meal'));
    } else {
      console.log('\nAll entries for this user:');
      entries.forEach((e, i) => {
        console.log(`${i+1}. ${e.content.substring(0, 100)}...`);
      });
    }
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
