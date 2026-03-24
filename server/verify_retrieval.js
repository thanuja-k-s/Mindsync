const { retrieveContext } = require('./utils/ragService');
const mongoose = require('mongoose');

const userId = '696f16c00150793863f1ceeb';

async function verifySynthesis() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mindsync');

        const queries = [
            "tell about temple visit",
            "how am i doing at the gym?",
            "any patterns in my entries?",
            "tell about ram marriage"
        ];

        console.log('--- VERIFYING RETRIEVAL ACCURACY ---');

        for (const query of queries) {
            const entries = await retrieveContext(userId, query, 3);
            console.log(`\nQuery: "${query}"`);
            if (entries.length > 0) {
                entries.forEach((e, i) => {
                    console.log(`  [${i}] Sim: ${e.similarity.toFixed(3)}, KeyScore: ${e.keywordMatch.toFixed(1)}`);
                    console.log(`      Text: ${e.text.substring(0, 120).replace(/\n/g, ' ')}...`);
                });
            } else {
                console.log('  ❌ NO ENTRIES FOUND');
            }
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

verifySynthesis();
