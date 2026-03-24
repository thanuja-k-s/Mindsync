// Debug the exact query the user is making
const mongoose = require('mongoose');
const { generateEmbedding, cosineSimilarity, extractKeywords, KEYWORD_GROUPS } = require('./utils/embeddingService');
const RAGIndex = require('./models/RAGIndex');
require('dotenv').config();

async function debugUserQuery() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsync');
    
    const brindhaId = '696f16c00150793863f1ceeb';
    const queries = [
      'hi',
      'tell about ram marriage'
    ];
    
    for (const query of queries) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`Query: "${query}"`);
      console.log('='.repeat(70));
      
      // Get all entries
      const allEntries = await RAGIndex.find({ userId: brindhaId }).lean();
      const queryEmbedding = generateEmbedding(query);
      const queryKeywords = extractKeywords(query);
      
      console.log(`Total entries: ${allEntries.length}`);
      console.log(`Query keywords: ${Object.keys(queryKeywords).join(', ') || '(none after filtering)'}\n`);
      
      // Score all entries
      const scoredEntries = allEntries.map((entry, idx) => {
        const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
        const entryKeywords = extractKeywords(entry.text);
        
        // Calculate keyword score
        let matchCount = 0;
        for (const keyword of Object.keys(queryKeywords)) {
          if (entryKeywords[keyword]) {
            matchCount += Math.min(queryKeywords[keyword], entryKeywords[keyword]) * 2;
          }
        }
        
        let groupMatches = 0;
        let hasStrongTopicMatch = false;
        const matchedGroups = [];
        
        for (const [groupName, groupKeywords] of Object.entries(KEYWORD_GROUPS)) {
          let queryGroupMatches = groupKeywords.filter(kw => queryKeywords[kw]).length;
          let entryGroupMatches = groupKeywords.filter(kw => entryKeywords[kw]).length;
          
          if (queryGroupMatches > 0 && entryGroupMatches > 0) {
            const topicWeight = Math.min(queryGroupMatches, entryGroupMatches) * 3;
            groupMatches += topicWeight;
            matchedGroups.push(`${groupName}(${topicWeight})`);
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
        let weightKeyword = 0.3;
        let weightSimilarity = 0.7;
        if (keywordMatch > 3) {
          weightKeyword = 0.75;
          weightSimilarity = 0.25;
        }
        
        const finalScore = (similarity * weightSimilarity) + (keywordMatch * weightKeyword);
        
        return {
          entryText: entry.text.substring(0, 70),
          mood: entry.metadata?.mood,
          similarity: parseFloat(similarity.toFixed(3)),
          keywordMatch: parseFloat(keywordMatch.toFixed(2)),
          finalScore: parseFloat(finalScore.toFixed(3)),
          hasStrongTopicMatch,
          matchedKeywords: Object.keys(queryKeywords).filter(kw => entryKeywords[kw]),
          fullText: entry.text
        };
      });

      // Find ram marriage entry
      const ramMarriage = scoredEntries.find(e => e.fullText.includes('ram marriage'));
      
      // Sort by score
      scoredEntries.sort((a, b) => b.finalScore - a.finalScore);
      
      console.log('TOP 5 RESULTS:\n');
      scoredEntries.slice(0, 5).forEach((entry, i) => {
        const isRamMarriage = entry.fullText.includes('ram marriage') ? '🎯 RAM MARRIAGE' : '';
        console.log(`${i + 1}. Score: ${entry.finalScore} | Sim: ${entry.similarity} | KW: ${entry.keywordMatch} ${isRamMarriage}`);
        console.log(`   "${entry.entryText}..."`);
        console.log(`   Mood: ${entry.mood}\n`);
      });
      
      if (ramMarriage) {
        const ramIndex = scoredEntries.indexOf(ramMarriage) + 1;
        console.log(`\n🎯 RAM MARRIAGE ENTRY RANK: #${ramIndex}`);
        console.log(`   Score: ${ramMarriage.finalScore}`);
        console.log(`   Similarity: ${ramMarriage.similarity}`);
        console.log(`   Keyword Match: ${ramMarriage.keywordMatch}`);
        console.log(`   Keywords: ${ramMarriage.matchedKeywords.join(', ') || 'NONE'}`);
      } else {
        console.log('\n❌ RAM MARRIAGE ENTRY NOT FOUND IN RESULTS');
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

debugUserQuery();
