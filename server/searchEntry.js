// Search for the "ram marriage" entry
const mongoose = require('mongoose');
const db_url = 'mongodb://localhost:27017/mindsync';
require('dotenv').config();

async function searchEntry() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || db_url);
    console.log('✅ Connected\n');

    // Get direct access to the collection
    const dbConn = mongoose.connection.db;
    const entriesCollection = dbConn.collection('entries');
    
    console.log('🔍 Searching for "ram marriage" entry...');
    const result = await entriesCollection.find({
      $or: [
        { content: { $regex: 'ram.*marriage', $options: 'i' } },
        { content: { $regex: 'marriage', $options: 'i' } }
      ]
    }).toArray();
    
    console.log(`Found ${result.length} entries with "marriage":\n`);
    
    result.forEach(entry => {
      console.log(`Entry ID: ${entry._id}`);
      console.log(`UserId: ${entry.userId} (type: ${typeof entry.userId})`);
      console.log(`Mood: ${entry.mood}`);
      console.log(`Content: ${entry.content.substring(0, 100)}...\n`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

searchEntry();
