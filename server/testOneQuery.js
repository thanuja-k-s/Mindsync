const fetch = require('node-fetch');

const API_URL = 'http://localhost:3002/api/rag/query';
const USER_ID = '696f16c00150793863f1ceeb';

async function testCooking() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID, query: 'Tell me about my cooking experience' })
    });
    
    const data = await response.json();
    console.log('Response:', data.response);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testCooking();
