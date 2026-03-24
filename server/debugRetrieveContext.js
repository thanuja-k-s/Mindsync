const mongoose = require('mongoose');
const RAGIndex = require('./models/RAGIndex');
const { generateEmbedding, findSimilar, cosineSimilarity } = require('./utils/embeddingService');

async function debugRetrieveContext() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');
    console.log('Connected to MongoDB');

    // Find a user
    const User = require('./models/User');
    const user = await User.findOne({ username: 'brindha' });
    const userId = user._id.toString();
    console.log(`\nTesting with userId: ${userId}`);

    // Get all entries
    const allEntries = await RAGIndex.find({ userId }).lean();
    console.log(`Retrieved ${allEntries.length} entries from database`);

    if (allEntries.length === 0) {
      console.log('No entries found!');
      return;
    }

    // Generate query embedding
    const query = 'tell about gym';
    const queryEmbedding = generateEmbedding(query);
    console.log(`\nQuery: "${query}"`);
    console.log(`Query embedding generated, length: ${queryEmbedding.length}`);
    console.log(`Query embedding is array: ${Array.isArray(queryEmbedding)}`);
    console.log(`Query embedding non-zero dims: ${queryEmbedding.filter(v => v !== 0).length}`);

    // Test findSimilar function directly
    console.log('\n--- Testing findSimilar directly ---');
    const topK = 10;
    const similarEntries = findSimilar(queryEmbedding, allEntries, topK);
    console.log(`findSimilar returned: ${similarEntries.length} entries`);
    similarEntries.forEach((entry, i) => {
      console.log(`${i + 1}. Similarity: ${entry.similarity.toFixed(4)}, Text: "${entry.text?.substring(0, 50) || 'NO TEXT'}"`);
    });

    // Test cosine similarity manually
    console.log('\n--- Testing cosine similarity manually ---');
    allEntries.slice(0, 5).forEach((entry, i) => {
      const sim = cosineSimilarity(queryEmbedding, entry.embedding);
      console.log(`Entry ${i + 1} (${entry.text?.substring(0, 30)}) - Similarity: ${sim.toFixed(4)}, Type of embedding: ${typeof entry.embedding}, Is Array: ${Array.isArray(entry.embedding)}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugRetrieveContext();
