const { generateEmbedding, cosineSimilarity, extractKeywords } = require('./utils/embeddingService');

const query = "tell about temple visit";
const entryText = "Today I went to the temple with my friend brindha it was so peaceful and we stayed for hours it was a blessed day. 😊 calm, happy, and positive.";

const queryEmb = generateEmbedding(query);
const entryEmb = generateEmbedding(entryText);

console.log('--- Similarity Analysis ---');
const sim = cosineSimilarity(queryEmb, entryEmb);
console.log(`Query: "${query}"`);
console.log(`Entry: "${entryText}"`);
console.log(`Cosine Similarity: ${sim.toFixed(4)}`);

const queryKeywords = extractKeywords(query);
const entryKeywords = extractKeywords(entryText);
console.log('\nQuery Keywords:', queryKeywords);
console.log('Entry Keywords:', entryKeywords);

const matchingKeywords = Object.keys(queryKeywords).filter(kw => entryKeywords[kw]);
console.log('Matching Keywords:', matchingKeywords);

// Test without random noise
function generateEmbeddingNoNoise(text) {
    const { extractKeywords, KEYWORD_GROUPS } = require('./utils/embeddingService');
    const embedding = new Array(384).fill(0);
    const keywords = extractKeywords(text);

    let keywordIdx = 0;
    for (const [word, freq] of Object.entries(keywords).slice(0, 100)) {
        embedding[keywordIdx] = Math.min(freq / 10, 1);
        keywordIdx++;
    }

    let groupIdx = 100;
    for (const [groupName, groupKeywords] of Object.entries(KEYWORD_GROUPS)) {
        let groupScore = 0;
        groupKeywords.forEach(keyword => {
            if (keywords[keyword]) groupScore += keywords[keyword];
        });
        if (groupScore > 0) embedding[groupIdx] = Math.min(groupScore / 5, 1);
        groupIdx++;
    }

    const totalWords = Object.values(keywords).reduce((a, b) => a + b, 0);
    embedding[200] = Math.min(totalWords / 100, 1);
    embedding[201] = (new Set(Object.keys(keywords)).size) / 100;

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
        for (let i = 0; i < embedding.length; i++) embedding[i] /= magnitude;
    }
    return embedding;
}

const queryEmbNoNoise = generateEmbeddingNoNoise(query);
const entryEmbNoNoise = generateEmbeddingNoNoise(entryText);
const simNoNoise = cosineSimilarity(queryEmbNoNoise, entryEmbNoNoise);
console.log(`\nCosine Similarity (WITHOUT NOISE): ${simNoNoise.toFixed(4)}`);
