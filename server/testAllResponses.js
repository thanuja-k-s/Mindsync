const fetch = require('node-fetch');
const mongoose = require('mongoose');
const User = require('./models/User');

async function testAllResponses() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');

    const user = await User.findOne({ username: 'brindha' });
    const userId = user._id.toString();

    const testQueries = [
      'hi',
      'tell about ram marriage',
      'tell about gym',
      'tell about temple visit',
      'tell about my learnings'
    ];

    console.log('=== Testing All RAG Responses ===\n');

    for (const query of testQueries) {
      const response = await fetch('http://localhost:3002/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, query })
      });

      const data = await response.json();
      console.log(`📝 Query: "${query}"`);
      console.log(`   Full Response:`);
      console.log(`   "${data.response}"`);
      console.log('');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAllResponses();
