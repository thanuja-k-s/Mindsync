// Debug script to check what's in the database
const mongoose = require('mongoose');
const RAGIndex = require('./models/RAGIndex');
const Entry = require('./models/Entry');
require('dotenv').config();

async function debugDatabase() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsync');
    console.log('✅ Connected\n');

    // Find all users
    console.log('📋 === ALL USERS ===');
    const users = await Entry.distinct('userId');
    console.log(`Found ${users.length} unique users:`);
    users.forEach(uid => console.log(`  - ${uid} (type: ${typeof uid})`));

    // Check RAG indexes by user
    console.log('\n📋 === RAG INDEXES BY USER ===');
    for (const userId of users) {
      const count = await RAGIndex.countDocuments({ userId });
      console.log(`  User ${userId}: ${count} indexed entries`);
    }

    // Find entries for "brindha" (if it's stored as string)
    console.log('\n📋 === CHECKING FOR "brindha" USER ===');
    const stringUserEntries = await Entry.find({ userId: 'brindha' });
    console.log(`Entries where userId='brindha': ${stringUserEntries.length}`);

    // Show sample entries
    console.log('\n📋 === SAMPLE ENTRIES ===');
    const sampleEntries = await Entry.find().limit(5);
    sampleEntries.forEach(e => {
      console.log(`\nEntry ID: ${e._id}`);
      console.log(`UserId: ${e.userId} (type: ${typeof e.userId})`);
      console.log(`Content: ${e.content.substring(0, 50)}...`);
      console.log(`Mood: ${e.mood}`);
    });

    // Check RAG Index structure
    console.log('\n📋 === SAMPLE RAG INDEXES ===');
    const sampleRag = await RAGIndex.find().limit(5);
    sampleRag.forEach(r => {
      console.log(`\nRAG Entry ID: ${r._id}`);
      console.log(`UserId: ${r.userId} (type: ${typeof r.userId})`);
      console.log(`EntryId: ${r.entryId}`);
      console.log(`Text: ${r.text.substring(0, 50)}...`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

debugDatabase();
