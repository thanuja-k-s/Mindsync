const mongoose = require('mongoose');
const RAGIndex = require('./models/RAGIndex');

const userId = '696f16c00150793863f1ceeb';

async function checkIndex() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mindsync');
        const count = await RAGIndex.countDocuments({ userId });
        console.log(`User ${userId} has ${count} indexed entries.`);

        if (count > 0) {
            const sample = await RAGIndex.findOne({ userId });
            console.log('Sample entry text:', sample.text.substring(0, 50));
            console.log('Sample entry embedding length:', sample.embedding.length);
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkIndex();
