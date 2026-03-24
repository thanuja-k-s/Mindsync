const { retrieveContext } = require('./utils/ragService');
const mongoose = require('mongoose');

const userId = '696f16c00150793863f1ceeb';

async function verifyTemple() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mindsync');

        const query = "tell about temple visit";
        console.log(`Query: "${query}"`);

        const entries = await retrieveContext(userId, query, 3);

        if (entries.length > 0) {
            console.log('✅ FOUND MATCHES:');
            entries.forEach((e, i) => {
                console.log(`[${i}] Score: ${(e.similarity * 0.25 + e.keywordMatch * 0.75).toFixed(2)} | Text: ${e.text.substring(0, 100)}...`);
            });
            const hasTemple = entries.some(e => e.text.toLowerCase().includes('temple'));
            console.log(`Temple keyword in results: ${hasTemple ? '✅ YES' : '❌ NO'}`);
        } else {
            console.log('❌ NO ENTRIES FOUND');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

verifyTemple();
