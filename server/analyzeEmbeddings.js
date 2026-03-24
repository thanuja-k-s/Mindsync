const mongoose = require('mongoose');
const RAGIndex = require('./models/RAGIndex');
const { cosineSimilarity } = require('./utils/embeddingService');

async function analyzeEmbeddings() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');
    console.log('Connected to MongoDB');

    // Get all entries
    const entries = await RAGIndex.find().limit(10).lean();
    console.log(`Found ${entries.length} entries`);

    // Check similarity between first two entries
    if (entries.length >= 2) {
      const sim = cosineSimilarity(entries[0].embedding, entries[1].embedding);
      console.log(`\nSimilarity between entry 0 and 1: ${sim.toFixed(4)}`);
    }

    // Check what a "hi" embedding looks like
    console.log('\nEntry texts and their non-zero embedding dims:');
    entries.forEach((entry, i) => {
      const text = entry.text.substring(0, 50);
      const nonZeroDims = entry.embedding.filter(v => v !== 0).length;
      const magnitude = Math.sqrt(entry.embedding.reduce((sum, val) => sum + val * val, 0));
      const avgValue = entry.embedding.reduce((a, b) => a + b, 0) / entry.embedding.length;
      
      console.log(`${i + 1}. "${text}" - non-zero: ${nonZeroDims}/384, magnitude: ${magnitude.toFixed(4)}, avg: ${avgValue.toFixed(6)}`);
    });

    // Try generating a query embedding and checking its similarity
    const { generateEmbedding } = require('./utils/embeddingService');
    const queries = ['hi', 'tell about gym', 'tell about marriage', 'temple visit'];
    
    console.log('\nQuery embedding analysis:');
    queries.forEach(query => {
      const emb = generateEmbedding(query);
      const nonZeroDims = emb.filter(v => v !== 0).length;
      const magnitude = Math.sqrt(emb.reduce((sum, val) => sum + val * val, 0));
      
      console.log(`\n"${query}":
  - non-zero dims: ${nonZeroDims}/384
  - magnitude: ${magnitude.toFixed(4)}`);
      
      // Check similarity with first few entries
      entries.slice(0, 3).forEach((entry, idx) => {
        const sim = cosineSimilarity(emb, entry.embedding);
        console.log(`  Similarity with entry ${idx + 1}: ${sim.toFixed(4)}`);
      });
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeEmbeddings();
