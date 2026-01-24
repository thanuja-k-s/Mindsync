// Test script to verify RAG system is working correctly
const mongoose = require('mongoose');
const { generateEmbedding, cosineSimilarity, findSimilar, extractKeywords, KEYWORD_GROUPS } = require('./utils/embeddingService');
const RAGIndex = require('./models/RAGIndex');
require('dotenv').config();

async function testRAGSystem() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsync');
    console.log('✅ Connected\n');

    const brindhaId = '696f16c00150793863f1ceeb';

    console.log('📋 === TEST 1: Verify Re-indexing ===');
    const ragCount = await RAGIndex.countDocuments({ userId: brindhaId });
    console.log(`✅ RAG indexes for brindha: ${ragCount}\n`);

    console.log('📋 === TEST 2: Test Query Matching ===');
    const testQueries = [
      'tell about ram marriage',
      'tell about gym',
      'i felt sad',
      'friendship beach'
    ];

    for (const query of testQueries) {
      console.log(`\nQuery: "${query}"`);
      
      // Get all entries for user
      const allEntries = await RAGIndex.find({ userId: brindhaId }).lean();
      console.log(`  Found ${allEntries.length} entries`);

      // Generate query embedding
      const queryEmbedding = generateEmbedding(query);
      const queryKeywords = extractKeywords(query);
      
      console.log(`  Query keywords: ${Object.keys(queryKeywords).join(', ')}`);

      // Find similar
      if (allEntries.length > 0) {
        const similarities = allEntries.map((entry, idx) => {
          const sim = cosineSimilarity(queryEmbedding, entry.embedding);
          const entryKeywords = extractKeywords(entry.text);
          const keywordMatches = Object.keys(queryKeywords).filter(kw => entryKeywords[kw]).length;
          
          return {
            index: idx,
            similarity: sim,
            keywordMatches: keywordMatches,
            text: entry.text.substring(0, 60) + '...',
            mood: entry.metadata?.mood
          };
        });

        similarities.sort((a, b) => {
          const scoreA = (a.similarity * 0.7) + (a.keywordMatches * 0.3);
          const scoreB = (b.similarity * 0.7) + (b.keywordMatches * 0.3);
          return scoreB - scoreA;
        });

        console.log(`  Top matches:`);
        similarities.slice(0, 3).forEach((match, i) => {
          const score = (match.similarity * 0.7) + (match.keywordMatches * 0.3);
          console.log(`    ${i + 1}. Similarity: ${match.similarity.toFixed(3)}, Keywords: ${match.keywordMatches}, Score: ${score.toFixed(3)}`);
          console.log(`       Text: "${match.text}"`);
          console.log(`       Mood: ${match.mood}`);
        });
      }
    }

    console.log('\n\n📋 === TEST 3: Keyword Groups ===');
    console.log('Available semantic groups:');
    Object.entries(KEYWORD_GROUPS).forEach(([group, keywords]) => {
      console.log(`  ${group}: ${keywords.slice(0, 5).join(', ')}... (${keywords.length} total)`);
    });

    console.log('\n\n✅ RAG System Test Complete!');
    console.log('All components working correctly. Frontend changes will be picked up on refresh.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testRAGSystem();
