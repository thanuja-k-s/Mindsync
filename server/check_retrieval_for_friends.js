const mongoose = require('mongoose');
const { retrieveContext } = require('./utils/ragService');

async function checkRetrieval() {
    const userId = '696f16c00150793863f1ceeb';
    const query = "Who are the friends I mention most?";

    try {
        await mongoose.connect('mongodb://localhost:27017/mindsync');

        console.log(`\nRetrieval for: "${query}"`);
        const entries = await retrieveContext(userId, query, 5);

        entries.forEach((e, i) => {
            console.log(`[${i + 1}] ${e.text}`);
        });

        const allText = entries.map(e => e.text || '').join(' ').toLowerCase();

        const friendMentions = {
            Kavya: (allText.match(/kavya/g) || []).length,
            Ram: (allText.match(/ram/g) || []).length,
            Brindha: (allText.match(/brindha/g) || []).length,
            Friend: (allText.match(/friend/g) || []).length
        };

        console.log('Friend counts in these entries:', friendMentions);

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkRetrieval();
