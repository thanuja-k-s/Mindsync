const fetch = require('node-fetch');

async function testQuery() {
    const userId = '696f16c00150793863f1ceeb';
    const query = 'any patterns in my entries';

    try {
        const response = await fetch('http://localhost:3002/api/rag/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, query })
        });

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testQuery();
