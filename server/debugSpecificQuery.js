// Targeted debug for "with whom i went to ram marriage" query
const mongoose = require('mongoose');
const { generateEmbedding, cosineSimilarity, extractKeywords, KEYWORD_GROUPS } = require('./utils/embeddingService');
const RAGIndex = require('./models/RAGIndex');
require('dotenv').config();

async function debugSpecificQuery() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindsync');
    
    const brindhaId = '696f16c00150793863f1ceeb';
    const query = 'with whom i went to ram marriage';
    
    console.log(`\n🔍 Debugging Query: "${query}"\n`);
    
    // Get all entries
    const allEntries = await RAGIndex.find({ userId: brindhaId }).lean();
    const queryEmbedding = generateEmbedding(query);
    const queryKeywords = extractKeywords(query);
    
    console.log(`Total entries for user: ${allEntries.length}`);
    console.log(`Query keywords: ${Object.keys(queryKeywords).join(', ')}\n`);
    
    // Score all entries
    const scoredEntries = allEntries.map((entry, idx) => {
      const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
      const entryKeywords = extractKeywords(entry.text);
      const entryText = entry.text;
      
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
      
      // Determine weighting
      const maxKeywordScore = 10; // rough estimate
      let weightKeyword = keywordMatch > 3 ? 0.75 : 0.3;
      let weightSimilarity = 1 - weightKeyword;
      
      const finalScore = (similarity * weightSimilarity) + (keywordMatch * weightKeyword);
      
      return {
        entryText: entryText.substring(0, 80),
        mood: entry.metadata?.mood,
        similarity: parseFloat(similarity.toFixed(3)),
        keywordMatch: parseFloat(keywordMatch.toFixed(2)),
        matchedGroups: matchedGroups.join(', '),
        finalScore: parseFloat(finalScore.toFixed(3)),
        hasStrongTopicMatch,
        matchedKeywords: Object.keys(queryKeywords).filter(kw => entryKeywords[kw])
      };
    });

    // Find the ram marriage entry specifically
    const ramMarriageEntry = scoredEntries.find(e => e.entryText.includes('ram marriage'));
    
    console.log('🎯 RAM MARRIAGE ENTRY:');
    if (ramMarriageEntry) {
      console.log(`Text: "${ramMarriageEntry.entryText}..."`);
      console.log(`Mood: ${ramMarriageEntry.mood}`);
      console.log(`Similarity Score: ${ramMarriageEntry.similarity}`);
      console.log(`Keyword Match Score: ${ramMarriageEntry.keywordMatch}`);
      console.log(`Matched Keyword Groups: ${ramMarriageEntry.matchedGroups}`);
      console.log(`Matched Keywords: ${ramMarriageEntry.matchedKeywords.join(', ')}`);
      console.log(`Has Strong Topic Match: ${ramMarriageEntry.hasStrongTopicMatch ? '✅ YES' : '❌ NO'}`);
      console.log(`Final Score: ${ramMarriageEntry.finalScore}`);
    } else {
      console.log('❌ RAM MARRIAGE ENTRY NOT FOUND!');
    }
    
    // Sort and show top 5
    console.log('\n📊 TOP 5 RESULTS:\n');
    scoredEntries.sort((a, b) => b.finalScore - a.finalScore);
    
    scoredEntries.slice(0, 5).forEach((entry, i) => {
      console.log(`${i + 1}. Score: ${entry.finalScore} | Sim: ${entry.similarity} | KW: ${entry.keywordMatch}`);
      console.log(`   "${entry.entryText}..."`);
      console.log(`   Mood: ${entry.mood} | Groups: ${entry.matchedGroups || 'none'}`);
      console.log(`   Keywords: ${entry.matchedKeywords.join(', ') || 'none'}\n`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

debugSpecificQuery();
