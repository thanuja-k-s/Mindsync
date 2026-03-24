const mongoose = require('mongoose');
const RAGIndex = require('./models/RAGIndex');
const { generateEmbedding, cosineSimilarity, extractKeywords, KEYWORD_GROUPS } = require('./utils/embeddingService');
const User = require('./models/User');

async function analyzeScores() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');

    const user = await User.findOne({ username: 'brindha' });
    const userId = user._id;

    const allEntries = await RAGIndex.find({ userId }).lean();
    console.log(`Analyzing ${allEntries.length} entries for query "tell about ram marriage"\n`);

    const query = 'tell about ram marriage';
    const queryEmbedding = generateEmbedding(query);

    // Function to calculate keyword match
    function calculateKeywordMatchScore(queryText, entryText) {
      const queryKeywords = extractKeywords(queryText);
      const entryKeywords = extractKeywords(entryText);
      
      let matchCount = 0;
      for (const keyword of Object.keys(queryKeywords)) {
        if (entryKeywords[keyword]) {
          matchCount += Math.min(queryKeywords[keyword], entryKeywords[keyword]) * 2;
        }
      }
      
      let groupMatches = 0;
      for (const [groupName, groupKeywords] of Object.entries(KEYWORD_GROUPS)) {
        let queryGroupMatches = groupKeywords.filter(kw => queryKeywords[kw]).length;
        let entryGroupMatches = groupKeywords.filter(kw => entryKeywords[kw]).length;
        
        if (queryGroupMatches > 0 && entryGroupMatches > 0) {
          const topicWeight = Math.min(queryGroupMatches, entryGroupMatches) * 3;
          groupMatches += topicWeight;
        }
      }
      
      return matchCount + groupMatches;
    }

    // Score all entries
    const allScores = allEntries.map((entry, idx) => ({
      idx,
      text: entry.text.substring(0, 60),
      similarity: cosineSimilarity(queryEmbedding, entry.embedding),
      keywordMatch: calculateKeywordMatchScore(query, entry.text)
    }));

    // Sort by final score (like in ragService)
    const maxKeywordScore = Math.max(...allScores.map(e => e.keywordMatch));
    let weightKeyword = 0.3;
    let weightSimilarity = 0.7;
    if (maxKeywordScore > 3) {
      weightKeyword = 0.75;
      weightSimilarity = 0.25;
    }

    const allScoresWithFinal = allScores.map(score => ({
      ...score,
      finalScore: (score.similarity * weightSimilarity) + (score.keywordMatch * weightKeyword)
    }));

    allScoresWithFinal.sort((a, b) => b.finalScore - a.finalScore);

    console.log(`Query weights: ${(weightSimilarity * 100).toFixed(0)}% similarity, ${(weightKeyword * 100).toFixed(0)}% keywords\n`);
    console.log('Top 10 entries by final score:');
    allScoresWithFinal.slice(0, 10).forEach((score, i) => {
      const isMarriage = score.text.includes('ram') || score.text.includes('marriage');
      const marker = isMarriage ? ' 👰 MARRIAGE ENTRY' : '';
      console.log(`${i+1}. Final: ${score.finalScore.toFixed(3)} (Sim: ${score.similarity.toFixed(3)}, KW: ${score.keywordMatch.toFixed(2)}) "${score.text}..."${marker}`);
    });

    // Find marriage entry rank
    const marriageIdx = allScoresWithFinal.findIndex(s => s.text.includes('ram'));
    console.log(`\n👰 Marriage entry rank: #${marriageIdx + 1}`);
    if (marriageIdx >= 0) {
      console.log(`   Final score: ${allScoresWithFinal[marriageIdx].finalScore.toFixed(3)}`);
      console.log(`   Similarity: ${allScoresWithFinal[marriageIdx].similarity.toFixed(4)}`);
      console.log(`   Keyword match: ${allScoresWithFinal[marriageIdx].keywordMatch.toFixed(2)}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

analyzeScores();
