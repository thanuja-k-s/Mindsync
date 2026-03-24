const mongoose = require('mongoose');
const RAGIndex = require('./models/RAGIndex');

async function checkEmbeddings() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');
    console.log('Connected to MongoDB');

    // Get one entry with its embedding
    const entry = await RAGIndex.findOne().lean();
    if (!entry) {
      console.log('No entries found');
      return;
    }

    console.log('Entry ID:', entry._id);
    console.log('Entry text:', entry.text.substring(0, 100));
    console.log('Entry embedding type:', typeof entry.embedding);
    console.log('Entry embedding is array?', Array.isArray(entry.embedding));
    console.log('Entry embedding length:', Array.isArray(entry.embedding) ? entry.embedding.length : 'N/A');
    
    if (Array.isArray(entry.embedding)) {
      console.log('First 5 values:', entry.embedding.slice(0, 5));
      console.log('Last 5 values:', entry.embedding.slice(-5));
    } else {
      console.log('Embedding structure:', JSON.stringify(entry.embedding).substring(0, 200));
    }

    // Check embedding schema
    const schema = RAGIndex.schema;
    console.log('\nEmbedding field in schema:');
    const embeddingPath = schema.path('embedding');
    console.log('  Type:', embeddingPath.instance);
    console.log('  Constructor:', embeddingPath.constructor.name);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEmbeddings();
