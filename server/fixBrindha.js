// Fix script using direct MongoDB queries to bypass Mongoose validation
const mongoose = require('mongoose');
const RAGIndex = require('./models/RAGIndex');
const { indexEntry } = require('./utils/ragService');
require('dotenv').config();

async function fixBrindhaUser() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsync');
    console.log('✅ Connected\n');

    // Get direct access to the collection to bypass Mongoose schema validation
    const db = mongoose.connection.db;
    const entriesCollection = db.collection('entries');
    
    console.log('🔍 Finding entries for brindha user...');
    const brindhaEntries = await entriesCollection.find({ userId: 'brindha' }).toArray();
    console.log(`Found ${brindhaEntries.length} entries for brindha\n`);

    if (brindhaEntries.length > 0) {
      console.log('📝 Entries:');
      brindhaEntries.forEach(e => {
        const content = e.content || '';
        console.log(`  - ${e._id}: ${content.substring(0, 60)}...`);
      });

      console.log('\n🔄 Re-indexing brindha entries...');
      
      for (const entry of brindhaEntries) {
        try {
          const content = entry.content || '';
          await indexEntry('brindha', entry._id.toString(), content, {
            date: entry.createdAt || new Date(),
            mood: entry.mood || 'neutral',
            tags: entry.tags || []
          });
          console.log(`✅ Indexed: ${entry._id}`);
        } catch (error) {
          console.error(`❌ Error indexing ${entry._id}:`, error.message);
        }
      }
      
      console.log('\n🎉 Successfully indexed all brindha entries!');
    } else {
      console.log('⚠️  No entries found for brindha user');
    }

    // Verify
    console.log('\n📋 Verifying RAG indexes...');
    const ragCount = await RAGIndex.countDocuments({ userId: 'brindha' });
    console.log(`RAG Indexes for brindha: ${ragCount}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixBrindhaUser();
