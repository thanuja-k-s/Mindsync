const mongoose = require('mongoose');
const RAGIndex = require('./models/RAGIndex');
const User = require('./models/User');

async function checkRAGIndex() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');

    const user = await User.findOne({ username: 'brindha' });
    const userId = user._id;

    const ragEntries = await RAGIndex.find({ userId }).lean();
    console.log(`Found ${ragEntries.length} entries in RAGIndex for brindha\n`);
    
    // Check if marriage entry is there
    const marriageEntry = ragEntries.find(e => 
      e.text && e.text.toLowerCase().includes('marriage')
    );
    
    if (marriageEntry) {
      console.log('✓ Marriage entry found!');
      console.log(`  Text: "${marriageEntry.text}"`);
    } else {
      console.log('❌ Marriage entry NOT found in RAGIndex!');
      console.log('\nAll RAGIndex entries for brindha:');
      ragEntries.forEach((entry, i) => {
        console.log(`${i+1}. "${entry.text.substring(0, 60)}..."`);
      });
    }

    // Also check Entry model directly
    const Entry = require('./models/Entry');
    const entries = await Entry.find({ userId }).lean();
    console.log(`\n\nEntry model has ${entries.length} entries`);
    const hasMarriage = entries.find(e => e.content.toLowerCase().includes('marriage'));
    console.log(`Marriage entry in Entry model: ${hasMarriage ? 'YES' : 'NO'}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRAGIndex();
