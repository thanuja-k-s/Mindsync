const RAGIndex = require('../models/RAGIndex');
const { generateEmbedding, findSimilar, extractKeywords, KEYWORD_GROUPS } = require('./embeddingService');

/**
 * RAG Service - Retrieval-Augmented Generation
 * Manages embedding creation, indexing, and retrieval
 */

/**
 * Index a new journal entry into RAG system
 */
async function indexEntry(userId, entryId, text, metadata = {}) {
  try {
    console.log('Indexing entry - userId:', userId, 'entryId:', entryId, 'text length:', text.length);
    
    // Generate embedding for the entry
    const embedding = generateEmbedding(text);
    
    // Check if already indexed and update
    let ragEntry = await RAGIndex.findOne({ userId, entryId });
    
    if (ragEntry) {
      console.log('Updating existing RAG index for entry:', entryId);
      ragEntry.text = text;
      ragEntry.embedding = embedding;
      ragEntry.metadata = metadata;
      await ragEntry.save();
    } else {
      console.log('Creating new RAG index for entry:', entryId);
      ragEntry = new RAGIndex({
        userId,
        entryId,
        text,
        embedding,
        metadata
      });
      await ragEntry.save();
    }
    
    console.log('Successfully indexed entry:', entryId);
    return ragEntry;
  } catch (error) {
    console.error('Error indexing entry:', error);
    throw error;
  }
}

/**
 * Calculate semantic keyword match score
 */
function calculateKeywordMatchScore(queryText, entryText) {
  const queryKeywords = extractKeywords(queryText);
  const entryKeywords = extractKeywords(entryText);
  
  // Count direct keyword matches (weighted by frequency)
  let matchCount = 0;
  for (const keyword of Object.keys(queryKeywords)) {
    if (entryKeywords[keyword]) {
      // Higher weight for important keywords
      matchCount += Math.min(queryKeywords[keyword], entryKeywords[keyword]) * 2;
    }
  }
  
  // Check semantic group matches - higher weight for topic-specific keywords
  let groupMatches = 0;
  let hasStrongTopicMatch = false;
  
  for (const [groupName, groupKeywords] of Object.entries(KEYWORD_GROUPS)) {
    let queryGroupMatches = groupKeywords.filter(kw => queryKeywords[kw]).length;
    let entryGroupMatches = groupKeywords.filter(kw => entryKeywords[kw]).length;
    
    if (queryGroupMatches > 0 && entryGroupMatches > 0) {
      // Strong topic match: both query and entry have keywords from same semantic group
      const topicWeight = Math.min(queryGroupMatches, entryGroupMatches) * 3; // 3x weight for topic matches
      groupMatches += topicWeight;
      
      // Flag if this is a strong topical match
      if (topicWeight >= 3) {
        hasStrongTopicMatch = true;
      }
    }
  }
  
  // Bonus for strong topic matches
  if (hasStrongTopicMatch) {
    groupMatches *= 1.5; // 50% bonus for clear topic alignment
  }
  
  return matchCount + groupMatches;
}

/**
 * Retrieve relevant context from RAG index based on query
 */
async function retrieveContext(userId, query, topK = 5) {
  try {
    // Generate embedding for the query
    const queryEmbedding = generateEmbedding(query);
    
    // Fetch all indexed entries for this user
    const allEntries = await RAGIndex.find({ userId }).lean();
    
    console.log(`Retrieved ${allEntries.length} indexed entries for userId: ${userId}`);
    
    if (allEntries.length === 0) {
      console.log('No entries found in RAG index for this user');
      return [];
    }
    
    // Find similar entries using embeddings
    let similarEntries = findSimilar(queryEmbedding, allEntries, topK * 2); // Get extra to filter
    
    // Add keyword match scoring
    similarEntries = similarEntries.map(entry => ({
      ...entry,
      keywordMatch: calculateKeywordMatchScore(query, entry.text)
    }));
    
    // Re-sort by adaptive scoring
    // If strong keyword matches exist, weight them more heavily
    similarEntries.sort((a, b) => {
      const maxKeywordScore = Math.max(...similarEntries.map(e => e.keywordMatch));
      
      // Adaptive weighting: if keyword scores are high, give them more weight
      let weightKeyword = 0.3; // Default: 30% keywords, 70% similarity
      let weightSimilarity = 0.7;
      
      if (maxKeywordScore > 3) {
        // Strong keyword matches detected - heavily prioritize keywords
        weightKeyword = 0.75; // 75% keywords, 25% similarity
        weightSimilarity = 0.25;
      }
      
      const scoreA = (a.similarity * weightSimilarity) + (a.keywordMatch * weightKeyword);
      const scoreB = (b.similarity * weightSimilarity) + (b.keywordMatch * weightKeyword);
      return scoreB - scoreA;
    });
    
    // Take top K after re-scoring
    similarEntries = similarEntries.slice(0, topK);
    
    console.log(`Found ${similarEntries.length} similar entries with improved matching`);
    similarEntries.forEach(entry => {
      console.log(`  - Similarity: ${entry.similarity.toFixed(3)}, Keyword Match: ${entry.keywordMatch.toFixed(2)}`);
    });
    
    return similarEntries.map(entry => ({
      text: entry.text,
      metadata: entry.metadata,
      similarity: entry.similarity,
      keywordMatch: entry.keywordMatch
    }));
  } catch (error) {
    console.error('Error retrieving context:', error);
    throw error;
  }
}

/**
 * Delete RAG index for an entry
 */
async function deleteEntryIndex(userId, entryId) {
  try {
    await RAGIndex.deleteOne({ userId, entryId });
  } catch (error) {
    console.error('Error deleting entry index:', error);
    throw error;
  }
}

/**
 * Clear all RAG indexes for a user (for privacy/deletion)
 */
async function clearUserIndex(userId) {
  try {
    await RAGIndex.deleteMany({ userId });
  } catch (error) {
    console.error('Error clearing user index:', error);
    throw error;
  }
}

/**
 * Build RAG context from retrieved entries
 */
function buildRAGContext(retrievedEntries) {
  if (retrievedEntries.length === 0) {
    return "No relevant journal entries found.";
  }
  
  const context = retrievedEntries
    .map((entry, idx) => {
      const date = entry.metadata?.date 
        ? new Date(entry.metadata.date).toLocaleDateString()
        : 'Unknown date';
      const mood = entry.metadata?.mood ? ` (Mood: ${entry.metadata.mood})` : '';
      return `Entry ${idx + 1} (${date}${mood}):\n${entry.text}`;
    })
    .join('\n\n');
    
  return context;
}

module.exports = {
  indexEntry,
  retrieveContext,
  deleteEntryIndex,
  clearUserIndex,
  buildRAGContext
};
