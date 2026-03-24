const fetch = require('node-fetch');

async function testPrecision() {
    const userId = '696f16c00150793863f1ceeb';
    const queries = [
        "Who are the friends I mention most?",
        "What was the marriage celebration like?",
        "How was my time with Kavya and Ram?",
        "Tell me about my temple visits."
    ];

    for (const query of queries) {
        console.log(`\n--- Query: "${query}" ---`);
        try {
            const response = await fetch('http://localhost:3002/api/rag/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, query })
            });

            const data = await response.json();
            console.log('Response:', data.response);
        } catch (err) {
            console.error('Fetch error:', err.message);
        }
    }
}

testPrecision();
