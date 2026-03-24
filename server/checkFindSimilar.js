const mongoose = require('mongoose');
const RAGIndex = require('./models/RAGIndex');
const { generateEmbedding, cosineSimilarity } = require('./utils/embeddingService');
const User = require('./models/User');

async function checkFindSimilar() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');

    const user = await User.findOne({ username: 'brindha' });
    const userId = user._id;

    const allEntries = await RAGIndex.find({ userId }).lean();
    const query = 'tell about ram marriage';
    const queryEmbedding = generateEmbedding(query);

    // Simulate findSimilar
    const similarities = allEntries.map((item, idx) => ({
      index: idx,
      similarity: cosineSimilarity(queryEmbedding, item.embedding),
      text: item.text.substring(0, 50),
      ...item
    }));
    
    // Sort and take top 10
    const topK = 5;
    const topEntries = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK * 2); // Top 10
    
    console.log(`Top 10 entries by similarity (before threshold filter):\n`);
    topEntries.forEach((entry, i) => {
      const isMarriage = entry.text.includes('ram');
      const marker = isMarriage ? ' 👰' : '';
      console.log(`${i+1}. Sim: ${entry.similarity.toFixed(4)} - "${entry.text}"${marker}`);
    });

    // Now apply threshold
    const filtered = topEntries.filter(item => item.similarity > 0.08);
    console.log(`\n\nAfter filtering by threshold > 0.08: ${filtered.length} entries`);
    filtered.forEach((entry, i) => {
      const isMarriage = entry.text.includes('ram');
      const marker = isMarriage ? ' 👰' : '';
      console.log(`${i+1}. Sim: ${entry.similarity.toFixed(4)} - "${entry.text}"${marker}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkFindSimilar();
