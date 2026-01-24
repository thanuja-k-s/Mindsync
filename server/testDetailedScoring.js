// Enhanced test with detailed keyword scoring
const mongoose = require('mongoose');
const { generateEmbedding, cosineSimilarity, findSimilar, extractKeywords, KEYWORD_GROUPS } = require('./utils/embeddingService');
const RAGIndex = require('./models/RAGIndex');
require('dotenv').config();

async function testDetailedScoring() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsync');
    console.log('✅ Connected\n');

    const brindhaId = '696f16c00150793863f1ceeb';
    const testQueries = ['tell about gym', 'tell about home', 'tell what i did at home'];

    for (const query of testQueries) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Query: "${query}"`);
      console.log('='.repeat(60));
      
      // Get all entries
      const allEntries = await RAGIndex.find({ userId: brindhaId }).lean();
      const queryEmbedding = generateEmbedding(query);
      const queryKeywords = extractKeywords(query);
      
      console.log(`Query keywords: ${Object.keys(queryKeywords).join(', ')}\n`);

      // Score all entries
      const scoredEntries = allEntries.map((entry, idx) => {
        const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
        const entryKeywords = extractKeywords(entry.text);
        
        // Calculate keyword score (same logic as ragService)
        let matchCount = 0;
        for (const keyword of Object.keys(queryKeywords)) {
          if (entryKeywords[keyword]) {
            matchCount += Math.min(queryKeywords[keyword], entryKeywords[keyword]) * 2;
          }
        }
        
        let groupMatches = 0;
        let hasStrongTopicMatch = false;
        for (const [groupName, groupKeywords] of Object.entries(KEYWORD_GROUPS)) {
          let queryGroupMatches = groupKeywords.filter(kw => queryKeywords[kw]).length;
          let entryGroupMatches = groupKeywords.filter(kw => entryKeywords[kw]).length;
          
          if (queryGroupMatches > 0 && entryGroupMatches > 0) {
            const topicWeight = Math.min(queryGroupMatches, entryGroupMatches) * 3;
            groupMatches += topicWeight;
            if (topicWeight >= 3) {
              hasStrongTopicMatch = true;
            }
          }
        }
        
        if (hasStrongTopicMatch) {
          groupMatches *= 1.5;
        }
        
        const keywordMatch = matchCount + groupMatches;
        
        // Adaptive scoring
        const maxKeywordScore = Math.max(...allEntries.map((e, i) => {
          let mc = 0;
          const ek = extractKeywords(e.text);
          for (const kw of Object.keys(queryKeywords)) {
            if (ek[kw]) mc += Math.min(queryKeywords[kw], ek[kw]) * 2;
          }
          let gm = 0;
          for (const [gn, gk] of Object.entries(KEYWORD_GROUPS)) {
            let qgm = gk.filter(w => queryKeywords[w]).length;
            let egm = gk.filter(w => ek[w]).length;
            if (qgm > 0 && egm > 0) {
              gm += Math.min(qgm, egm) * 3;
            }
          }
          return mc + gm;
        }));
        
        let weightKeyword = 0.3;
        let weightSimilarity = 0.7;
        if (maxKeywordScore > 3) {
          weightKeyword = 0.6;
          weightSimilarity = 0.4;
        }
        
        const finalScore = (similarity * weightSimilarity) + (keywordMatch * weightKeyword);
        
        return {
          text: entry.text.substring(0, 60) + '...',
          mood: entry.metadata?.mood,
          similarity: similarity.toFixed(3),
          keywordMatch: keywordMatch.toFixed(2),
          finalScore: finalScore.toFixed(3),
          hasStrongTopicMatch
        };
      });

      // Sort by final score
      scoredEntries.sort((a, b) => parseFloat(b.finalScore) - parseFloat(a.finalScore));
      
      console.log(`Top 5 Results (sorted by final score):\n`);
      scoredEntries.slice(0, 5).forEach((entry, i) => {
        console.log(`${i + 1}. Score: ${entry.finalScore} (Sim: ${entry.similarity}, KW: ${entry.keywordMatch}, Topic: ${entry.hasStrongTopicMatch ? '✅' : '❌'})`);
        console.log(`   "${entry.text}"`);
        console.log(`   Mood: ${entry.mood}\n`);
      });
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDetailedScoring();
