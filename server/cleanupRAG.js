// Script to clear old RAG indexes and re-index entries with improved embeddings
const mongoose = require('mongoose');
const Entry = require('./models/Entry');
const RAGIndex = require('./models/RAGIndex');
const { indexEntry } = require('./utils/ragService');
require('dotenv').config();

async function cleanupAndReindex() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsync');
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Clearing all RAG indexes...');
    const deleteResult = await RAGIndex.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} old RAG indexes`);

    console.log('\n🔄 Re-indexing all entries with improved embeddings...');
    const entries = await Entry.find({});
    console.log(`Found ${entries.length} entries to re-index`);

    let indexed = 0;
    for (const entry of entries) {
      try {
        await indexEntry(entry.userId, entry._id.toString(), entry.content, {
          date: entry.date,
          mood: entry.mood,
          tags: entry.tags || []
        });
        indexed++;
        console.log(`✅ Indexed entry ${indexed}/${entries.length}`);
      } catch (error) {
        console.error(`❌ Error indexing entry ${entry._id}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully re-indexed ${indexed} entries with improved embeddings!`);
    console.log('All queries will now return more relevant entries.');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupAndReindex();
