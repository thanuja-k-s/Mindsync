// Test the RAG API endpoint directly
const fetch = require('node-fetch');

async function testRAGAPI() {
  console.log('Testing RAG API Endpoint...\n');
  
  // Wait for server to start
  await new Promise(r => setTimeout(r, 2000));
  
  const userId = '696f16c00150793863f1ceeb';
  const query = 'tell about ram marriage';
  
  console.log(`Query: "${query}"`);
  console.log(`UserId: ${userId}\n`);
  
  try {
    const response = await fetch('http://localhost:3002/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, query })
    });

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      const text = await response.text();
      console.log('Response:', text);
      process.exit(1);
    }

    const data = await response.json();
    
    console.log('=== RAG RESPONSE ===');
    console.log(data.response);
    
    console.log('\n=== ENTRIES RETRIEVED ===');
    console.log(`Count: ${data.entriesUsed}`);
    
    if (data.context) {
      console.log('\n=== CONTEXT (first 300 chars) ===');
      console.log(data.context.substring(0, 300));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

testRAGAPI();
