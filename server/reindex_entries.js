const mongoose = require('mongoose');
const Entry = require('./models/Entry');
const { indexEntry } = require('./utils/ragService');

const userId = '696f16c00150793863f1ceeb';

async function reindex() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mindsync');
        console.log('Connected to MongoDB');

        const entries = await Entry.find({ userId });
        console.log(`Found ${entries.length} entries to re-index`);

        for (const e of entries) {
            console.log(`Indexing: ${e._id} - ${e.content.substring(0, 30)}...`);
            await indexEntry(userId, e._id, e.content, {
                date: e.createdAt,
                mood: e.mood,
                tags: e.tags
            });
        }

        console.log('✅ Re-indexing complete!');
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

reindex();
