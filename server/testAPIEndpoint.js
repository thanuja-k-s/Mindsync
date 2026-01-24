// Test the RAG API endpoint directly
const fetch = require('node-fetch');

async function testRAGAPI() {
  const testQueries = [
    'tell about ram marriage with whom i went',
    'with whom i went to ram marriage',
    'tell about ram marriage'
  ];

  console.log('Testing RAG API Endpoint...\n');

  for (const query of testQueries) {
    console.log(`Query: "${query}"`);
    
    try {
      const response = await fetch('http://localhost:3002/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '696f16c00150793863f1ceeb',
          query: query
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`  ✅ Found ${data.entriesUsed} entries`);
        console.log(`  First entry: "${data.context.split('\n')[1].substring(0, 60)}..."`);
        console.log(`  Response: "${data.response.substring(0, 80)}..."\n`);
      } else {
        console.log(`  ❌ Error: ${data.error}\n`);
      }
    } catch (error) {
      console.log(`  ❌ Connection error: ${error.message}\n`);
    }
  }

  process.exit(0);
}

testRAGAPI();
