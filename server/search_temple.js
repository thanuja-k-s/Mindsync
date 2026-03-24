const mongoose = require('mongoose');
const Entry = require('./models/Entry');

const userId = '696f16c00150793863f1ceeb';

async function search() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mindsync');
        const entries = await Entry.find({
            userId,
            content: { $regex: /temple/i }
        });

        console.log(`Found ${entries.length} entries matching 'temple'`);
        entries.forEach((e, i) => {
            console.log(`[${i}] ${e.createdAt.toLocaleDateString()}: ${e.content}`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

search();
