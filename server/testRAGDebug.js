const fetch = require('node-fetch');
const User = require('./models/User');
const mongoose = require('mongoose');
const RAGIndex = require('./models/RAGIndex');

async function testRAGDebug() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/mindsync');
    console.log('✓ Connected to MongoDB');

    // Get the brindha user
    const user = await User.findOne({ username: 'brindha' });
    if (!user) {
      console.log('❌ User brindha not found');
      return;
    }
    console.log('✓ Found user brindha with ID:', user._id);
    const userId = user._id.toString();

    // Check RAGIndex entries for this user
    const ragEntries = await RAGIndex.find({ userId }).lean();
    console.log(`\n✓ RAGIndex has ${ragEntries.length} entries for this user`);
    if (ragEntries.length > 0) {
      console.log('  First 3 entries:');
      ragEntries.slice(0, 3).forEach((entry, i) => {
        console.log(`    ${i + 1}. "${entry.text.substring(0, 60)}..."`);
      });
    }

    // Test API call to RAG endpoint
    console.log('\n🔄 Testing RAG API endpoint...');
    const testQueries = [
      'hi',
      'tell about temple visit',
      'tell about gym',
      'tell about ram marriage'
    ];

    for (const query of testQueries) {
      console.log(`\n📝 Query: "${query}"`);
      try {
        const response = await fetch('http://localhost:3002/api/rag/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            query: query
          })
        });

        if (!response.ok) {
          console.log(`❌ HTTP ${response.status}`);
          const text = await response.text();
          console.log(`   Response: ${text.substring(0, 100)}`);
          continue;
        }

        const data = await response.json();
        console.log(`✓ Response received`);
        console.log(`  Entries used: ${data.entriesUsed}`);
        console.log(`  Response: "${data.response.substring(0, 100)}..."`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testRAGDebug();
