// Enhanced embedding service using improved TF-IDF approach
// Focuses on semantic meaning through keyword grouping and weighted word importance

const crypto = require('crypto');

// Stopwords that don't carry meaning
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'this',
  'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your',
  'his', 'her', 'its', 'our', 'their', 'what', 'which', 'who', 'when', 'where', 'why',
  'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'same', 'so', 'than', 'too', 'very', 'just', 'about',
  'am', 'being', 'been', 'me', 'them', 'then', 'there', 'here', 'if', 'because'
]);

// Semantic keywords grouped by topic
const KEYWORD_GROUPS = {
  gym: ['gym', 'workout', 'exercise', 'fitness', 'strength', 'cardio', 'treadmill', 'weights', 'reps', 'sets', 'training', 'muscle', 'lifting', 'squats', 'chest', 'legs', 'arms', 'warm-up', 'cool-down', 'bicep', 'tricep', 'pulldown', 'press'],
  beach: ['beach', 'sand', 'ocean', 'sea', 'water', 'waves', 'shore', 'coast', 'seashore', 'seaside', 'surf', 'swimming'],
  sadness: ['sad', 'sadness', 'pain', 'hurt', 'disappointed', 'down', 'depressed', 'unhappy', 'miserable', 'heartbroken', 'upset', 'grief'],
  loneliness: ['lonely', 'loneliness', 'alone', 'isolated', 'solitude', 'disconnected', 'abandoned', 'unwanted'],
  happiness: ['happy', 'happiness', 'joy', 'joyful', 'excited', 'delighted', 'cheerful', 'proud', 'satisfied', 'accomplished', 'wonderful', 'fantastic'],
  anxiety: ['anxious', 'anxiety', 'worried', 'nervous', 'fear', 'afraid', 'uncertain', 'stressed', 'tension', 'nervous', 'scared', 'panic'],
  relationships: ['friend', 'friends', 'family', 'love', 'relationship', 'marriage', 'partner', 'husband', 'wife', 'people', 'person', 'mother', 'father', 'brother', 'sister', 'spouse'],
  work: ['work', 'job', 'career', 'project', 'task', 'professional', 'office', 'company', 'business', 'meeting', 'deadline', 'coding', 'coding'],
  goals: ['goal', 'goals', 'target', 'aim', 'objective', 'plan', 'future', 'progress', 'success', 'achievement', 'reach', 'accomplish'],
  home: ['home', 'house', 'room', 'apartment', 'family', 'house', 'stayed', 'stayed home', 'indoor', 'inside', 'living room', 'kitchen', 'bedroom'],
  temple: ['temple', 'church', 'prayer', 'worship', 'spiritual', 'meditation', 'faith', 'religious', 'sacred', 'blessing'],
  food: ['food', 'eat', 'eating', 'meal', 'lunch', 'dinner', 'breakfast', 'restaurant', 'cooking', 'recipe', 'veg', 'non-veg', 'meat', 'pizza', 'noodles', 'rice']
};

/**
 * Extract keywords with semantic importance
 */
function extractKeywords(text) {
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
  const keywordFreq = {};
  
  // Count word frequencies
  words.forEach(word => {
    keywordFreq[word] = (keywordFreq[word] || 0) + 1;
  });
  
  return keywordFreq;
}

/**
 * Generate enhanced embedding using keyword grouping
 */
function generateEmbedding(text) {
  const embedding = new Array(384).fill(0);
  const keywords = extractKeywords(text);
  
  // Map 1: Direct keyword frequency (dimensions 0-100)
  let keywordIdx = 0;
  for (const [word, freq] of Object.entries(keywords).slice(0, 100)) {
    embedding[keywordIdx] = Math.min(freq / 10, 1); // Normalize frequency
    keywordIdx++;
  }
  
  // Map 2: Semantic group matching (dimensions 100-200)
  let groupIdx = 100;
  for (const [groupName, groupKeywords] of Object.entries(KEYWORD_GROUPS)) {
    let groupScore = 0;
    groupKeywords.forEach(keyword => {
      if (keywords[keyword]) {
        groupScore += keywords[keyword];
      }
    });
    // Normalize group score
    if (groupScore > 0) {
      embedding[groupIdx] = Math.min(groupScore / 5, 1);
    }
    groupIdx++;
  }
  
  // Map 3: Text characteristics (dimensions 200-220)
  const totalWords = Object.values(keywords).reduce((a, b) => a + b, 0);
  embedding[200] = Math.min(totalWords / 100, 1); // Text length
  embedding[201] = (new Set(Object.keys(keywords)).size) / 100; // Vocabulary diversity
  
  // Map 4: Emotional intensity based on keyword presence
  const emotionKeywords = {
    positive: ['great', 'good', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'proud', 'happy', 'excited'],
    negative: ['bad', 'terrible', 'horrible', 'awful', 'sad', 'angry', 'frustrated', 'disappointed'],
    intense: ['very', 'extremely', 'incredibly', 'absolutely', 'definitely']
  };
  
  let emotionScore = 0;
  emotionKeywords.positive.forEach(word => {
    if (keywords[word]) emotionScore += keywords[word];
  });
  emotionKeywords.negative.forEach(word => {
    if (keywords[word]) emotionScore -= keywords[word];
  });
  embedding[202] = (emotionScore / 10 + 1) / 2; // Normalize to 0-1
  
  // Map 5: Remaining random-like dimensions (220-384)
  const textHash = hashString(text);
  for (let i = 220; i < 384; i++) {
    embedding[i] = Math.abs(Math.sin(textHash + i)) * 0.5;
  }
  
  // Normalize entire vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }
  
  return embedding;
}

/**
 * Calculate cosine similarity between two embeddings
 */
function cosineSimilarity(emb1, emb2) {
  if (!emb1 || !emb2 || emb1.length !== emb2.length) return 0;
  
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  for (let i = 0; i < emb1.length; i++) {
    dotProduct += emb1[i] * emb2[i];
    mag1 += emb1[i] * emb1[i];
    mag2 += emb2[i] * emb2[i];
  }
  
  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  if (magnitude === 0) return 0;
  
  return dotProduct / magnitude;
}

/**
 * Simple string hash function
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Find most similar embeddings with improved filtering
 */
function findSimilar(queryEmbedding, embeddings, topK = 5) {
  const similarities = embeddings.map((item, idx) => ({
    index: idx,
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
    ...item
  }));
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .filter(item => item.similarity > 0.15); // Slightly higher threshold for better filtering
}

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  findSimilar,
  extractKeywords,
  KEYWORD_GROUPS
};
