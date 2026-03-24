const mongoose = require('mongoose');
const RAGIndex = require('./models/RAGIndex');
const Entry = require('./models/Entry');

const userId = '696f16c00150793863f1ceeb';

async function dump() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mindsync');
        const entries = await Entry.find({ userId });
        console.log('--- ALL ENTRIES ---');
        entries.forEach((e, i) => {
            console.log(`[${i}] ${e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'No Date'} (${e.mood || 'No Mood'}): ${e.content}`);
        });

        const ragEntries = await RAGIndex.find({ userId });
        console.log('\n--- RAG INDEXED ENTRIES ---');
        ragEntries.forEach((e, i) => {
            console.log(`[${i}] ${e.text ? e.text.substring(0, 50) : 'NO TEXT'}...`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

dump();
