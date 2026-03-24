const mongoose = require('mongoose');
const Entry = require('./models/Entry');
const RAGIndex = require('./models/RAGIndex');

const userId = '696f16c00150793863f1ceeb';

async function checkIndex() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mindsync');

        const entries = await Entry.find({
            userId,
            content: { $regex: /temple/i }
        });

        console.log(`Found ${entries.length} entries matching 'temple' in Entry collection`);

        for (const e of entries) {
            const ragRecord = await RAGIndex.findOne({ entryId: e._id });
            if (ragRecord) {
                console.log(`✅ Entry ${e._id} (${e.createdAt.toLocaleDateString()}) is indexed in RAGIndex`);
            } else {
                console.log(`❌ Entry ${e._id} (${e.createdAt.toLocaleDateString()}) IS NOT indexed in RAGIndex`);
            }
        }

        // Also check for any RAGIndex records that might contain 'temple' but aren't linked correctly
        const ragMatches = await RAGIndex.find({
            userId,
            text: { $regex: /temple/i }
        });
        console.log(`\nFound ${ragMatches.length} records matching 'temple' in RAGIndex collection`);

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkIndex();
