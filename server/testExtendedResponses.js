const fetch = require('node-fetch');
const mongoose = require('mongoose');
const User = require('./models/User');

async function testExtendedResponses() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');

    const user = await User.findOne({ username: 'brindha' });
    const userId = user._id.toString();

    const testQueries = [
      'tell about temple visit',
      'What have I learned recently?',
      'Tell me about my time with friends',
      'How have I been feeling lately?',
      'Tell me about the times I felt happy',
      'When did I feel lonely?',
      'What makes me anxious?',
      'Tell me about my peaceful moments',
      'tell about my beach day',
      'tell about my worries'
    ];

    console.log('=== Testing All Response Handlers ===\n');

    for (const query of testQueries) {
      const response = await fetch('http://localhost:3002/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, query })
      });

      const data = await response.json();
      console.log(`🔹 Query: "${query}"`);
      console.log(`   ${data.response}\n`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testExtendedResponses();
