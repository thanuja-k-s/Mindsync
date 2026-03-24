const mongoose = require('mongoose');
const { retrieveContext } = require('./utils/ragService');
const User = require('./models/User');

const USER_ID = '696f16c00150793863f1ceeb'; // brindha

const testQueries = [
  'Tell me about my cooking experience',
  'How was my morning run',
  'Tell about my time with Kavya and Ram',
  'Tell me about my book club discussion',
  'Tell me about my work achievement',
  'What is my travel vision',
  'Tell about my conversation with mother'
];

async function debugScoring() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');
    console.log('Connected to MongoDB\n');
    
    for (const query of testQueries) {
      console.log('\n' + '='.repeat(80));
      console.log(`📊 QUERY: "${query}"`);
      console.log('='.repeat(80));
      
      const entries = await retrieveContext(USER_ID, query, 5);
      
      if (entries.length === 0) {
        console.log('❌ No entries retrieved!');
      } else {
        entries.forEach((entry, idx) => {
          console.log(`\n${idx + 1}. "${entry.text.substring(0, 60)}..."`);
          console.log(`   Similarity Score: ${entry.similarity?.toFixed(4) || 'N/A'}`);
          console.log(`   Keyword Score: ${entry.keywordScore?.toFixed(2) || 'N/A'}`);
          console.log(`   Final Score: ${entry.finalScore?.toFixed(2) || 'N/A'}`);
          console.log(`   Tags: ${entry.tags?.join(', ') || 'N/A'}`);
        });
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

debugScoring();
