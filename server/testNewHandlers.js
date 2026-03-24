const fetch = require('node-fetch');

const API_URL = 'http://localhost:3002/api/rag/query';
const USER_ID = '696f16c00150793863f1ceeb'; // brindha user ID

// Problem queries that were getting wrong responses
const testQueries = [
  'Tell me about my cooking experience',
  'How was my morning run',
  'Tell about my time with Kavya and Ram',
  'Tell me about my book club discussion',
  'Tell me about my work achievement',
  'What is my travel vision',
  'Tell about my conversation with mother'
];

async function testNewHandlers() {
  console.log('🧪 Testing New Response Handlers\n');
  console.log('='.repeat(80));
  
  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, query })
      });
      
      const data = await response.json();
      
      if (data.response) {
        console.log(`\n✅ #${i + 1}: "${query}"`);
        console.log(`   Response: ${data.response.substring(0, 120)}...`);
      }
    } catch (error) {
      console.log(`\n❌ #${i + 1}: "${query}"`);
      console.log(`   Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ All handlers tested! Check responses above.\n');
}

setTimeout(testNewHandlers, 1000);
