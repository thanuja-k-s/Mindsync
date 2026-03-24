const fetch = require('node-fetch');

const API_URL = 'http://localhost:3002/api/rag/query';
const USER_ID = '696f16c00150793863f1ceeb'; // brindha user ID

// Test queries covering all entry types
const testQueries = [
  // Original entries tests
  'tell about ram marriage',
  'tell me about my gym workout',
  'tell about my beach day',
  'tell about my learning',
  'tell about my friends',
  
  // New entries tests - Spiritual
  'tell me about my temple visit',
  'how was my spiritual practice',
  'tell about my prayer time',
  
  // New entries tests - Cooking/Food
  'tell about my cooking experience',
  'what did I cook today',
  'tell me about my grandmother\'s recipe',
  
  // New entries tests - Running/Fitness
  'tell me about my morning run',
  'how was my running session',
  'tell about my fitness journey',
  
  // New entries tests - Reflection
  'tell me about my rainy day thoughts',
  'how do I feel about reflection',
  'what did I think about on that rainy day',
  
  // New entries tests - Book Club
  'tell about my book club',
  'what did I discuss with friends',
  'tell me about my intellectual conversations',
  
  // New entries tests - Work
  'tell me about my work success',
  'tell about my project achievement',
  'how was my professional growth',
  
  // New entries tests - Family
  'tell me about my conversation with mother',
  'tell about my heartfelt family moment',
  'what did I share with my mother',
  
  // New entries tests - Yoga
  'tell me about my yoga practice',
  'how was my yoga session',
  'tell about my flexibility journey',
  
  // New entries tests - Travel
  'tell me about my travel dreams',
  'where do I want to go',
  'tell about my adventure plans',
  
  // New entries tests - Morning
  'tell me about my quiet morning',
  'what\'s my morning routine like',
  'tell about my gratitude practice',
  
  // Emotion-based tests
  'tell me about my happy moments',
  'when did I feel calm',
  'tell me about my peaceful time',
  'how do I handle anxiety',
  'tell about my peaceful feelings'
];

async function runTests() {
  console.log('🧪 Testing All MemoTalks Entries\n');
  console.log(`Total test queries: ${testQueries.length}\n`);
  console.log('='.repeat(80));
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, query })
      });
      
      const data = await response.json();
      
      if (response.status === 200 && data.response) {
        passedTests++;
        console.log(`\n✅ Test ${i + 1}: "${query}"`);
        console.log(`   Response: ${data.response.substring(0, 100)}...`);
        
        // Show if entries were retrieved
        if (data.entries) {
          console.log(`   Retrieved ${data.entries.length} entries`);
        }
      } else {
        failedTests++;
        console.log(`\n❌ Test ${i + 1}: "${query}"`);
        console.log(`   Status: ${response.status}, No response generated`);
      }
    } catch (error) {
      failedTests++;
      console.log(`\n❌ Test ${i + 1}: "${query}"`);
      console.log(`   Error: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Test Summary:`);
  console.log(`   ✅ Passed: ${passedTests}/${testQueries.length}`);
  console.log(`   ❌ Failed: ${failedTests}/${testQueries.length}`);
  console.log(`   Success Rate: ${((passedTests / testQueries.length) * 100).toFixed(1)}%\n`);
  
  if (failedTests === 0) {
    console.log('🎉 All tests passed! MemoTalks is working perfectly!\n');
  } else {
    console.log('⚠️  Some tests failed. Check the responses above.\n');
  }
}

// Wait a moment for server to be ready, then run tests
setTimeout(runTests, 1000);
