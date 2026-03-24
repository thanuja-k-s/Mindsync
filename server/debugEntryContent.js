const mongoose = require('mongoose');
const { retrieveContext } = require('./utils/ragService');
const User = require('./models/User');

async function debugEntryContent() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');

    const user = await User.findOne({ username: 'brindha' });
    const userId = user._id.toString();

    console.log('Retrieving context for "tell about ram marriage"\n');

    const context = await retrieveContext(userId, 'tell about ram marriage', 5);
    
    console.log(`Retrieved ${context.length} entries\n`);
    
    context.forEach((entry, i) => {
      console.log(`Entry ${i + 1}:`);
      console.log(`  Text: "${entry.text}"`);
      console.log(`  Similarity: ${entry.similarity.toFixed(4)}`);
      console.log(`  Keyword match: ${entry.keywordMatch.toFixed(2)}`);
      console.log('');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugEntryContent();
