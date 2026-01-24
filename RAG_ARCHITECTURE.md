# RAG System Architecture - Visual Guide

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                        │
│                       MemoTalks Component                        │
│                                                                  │
│  User: "How am I doing?"                                       │
│                                                                  │
│  POST /api/rag/query { userId, query }                         │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  POST /api/rag/query Handler                            │   │
│  │                                                           │   │
│  │  1. Extract userId & query                              │   │
│  │  2. Call retrieveContext()                              │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                            │
│                     ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  RAG Service (utils/ragService.js)                      │   │
│  │                                                           │   │
│  │  retrieveContext(userId, query, topK=5)                 │   │
│  │                                                           │   │
│  │  • generateEmbedding(query) → embedding vector          │   │
│  │  • Fetch RAGIndex entries for user                      │   │
│  │  • findSimilar(query_embedding, all_embeddings, 5)     │   │
│  │  • Return top 5 most relevant entries                   │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                            │
│                     ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MongoDB Database                                       │   │
│  │                                                           │   │
│  │  RAGIndex Collection                                    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ {                                               │    │   │
│  │  │   userId: "123",                               │    │   │
│  │  │   entryId: "abc",                              │    │   │
│  │  │   text: "I'm feeling excited...",              │    │   │
│  │  │   embedding: [0.12, -0.45, 0.67, ...],         │    │   │
│  │  │   metadata: { mood: "excited", date: "..." }   │    │   │
│  │  │ }                                               │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                           │   │
│  │  Returns: Top 5 similar entries                        │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                            │
│                     ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Response Generation (rag.js)                           │   │
│  │                                                           │   │
│  │  generateRAGResponse(query, context, entries)           │   │
│  │                                                           │   │
│  │  • Analyze emotion patterns in retrieved entries        │   │
│  │  • Match query with response templates                  │   │
│  │  • Generate contextual, personalized response           │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                            │
│                     ▼                                            │
│  Response: "Based on your recent entries, I see..."            │
│                                                                  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                               │
│                                                                  │
│  MemoTalks displays response in chat interface                 │
│                                                                  │
│  💭 AI: "Based on your recent entries, you've been feeling..  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Entry Indexing Flow (Automatic)

```
User creates/updates journal entry
        │
        ▼
POST /api/entries (Create/Update)
        │
        ├─────────────────────────┬──────────────────────────┐
        │                         │                          │
        ▼                         ▼                          ▼
   Save to                  Index to RAG            Update User
   Entries                  (if content)             Streak
Collection                                                  
        │                         │                          │
        │                    Generate                        │
        │                    Embedding                       │
        │                    (TF-IDF)                        │
        │                         │                          │
        │                    ┌────────────┐                  │
        │                    │ embedding: │                  │
        │                    │ [0.12,     │                  │
        │                    │  -0.45,    │                  │
        │                    │  0.67, ...]│                  │
        │                    └────────────┘                  │
        │                         │                          │
        │                    Store in                        │
        │                    RAGIndex                        │
        │                    Collection                      │
        │                                                    │
        └──────────────────────┬─────────────────────────────┘
                               │
                               ▼
                        Response to Frontend
                    "Entry saved and indexed!"
```

## Embedding & Similarity Search

```
Journal Entry: "I'm excited about my new project and feeling motivated"

        ↓
    
TF-IDF Embedding Generation
├─ Tokenize: ["excited", "project", "motivated", ...]
├─ Calculate word importance
├─ Create 384-dimensional vector
└─ Normalize: [0.12, -0.45, 0.67, 0.23, ...] (384 dimensions)

        ↓

User Query: "Am I making progress?"

        ↓

Generate Query Embedding (same TF-IDF process)
Query Vector: [0.15, -0.40, 0.65, 0.25, ...] (384 dimensions)

        ↓

Cosine Similarity Calculation
For each stored embedding:
    similarity = (Query · Entry) / (|Query| × |Entry|)
    Result: 0.0 to 1.0 (higher = more similar)

        ↓

Retrieve Top 5 Most Similar Entries
├─ Entry 1: similarity = 0.89 ✓ (Highly relevant)
├─ Entry 2: similarity = 0.76 ✓ (Relevant)
├─ Entry 3: similarity = 0.72 ✓ (Relevant)
├─ Entry 4: similarity = 0.65 ✓ (Somewhat relevant)
└─ Entry 5: similarity = 0.58 ✓ (Least relevant of top 5)

        ↓

Return Context to AI Generator
"Here are your most recent thoughts about progress..."
```

## Response Generation Logic

```
Retrieved Entries + User Query
        │
        ├─ Extract Emotions
        │  └─ mood: "excited" (appears 3 times)
        │  └─ mood: "motivated" (appears 2 times)
        │  └─ top_mood: "excited"
        │
        ├─ Match Query Type
        │  └─ Query includes: "progress"
        │  └─ Response category: "Progress/Growth"
        │
        └─ Generate Response
           └─ Select from response templates matching query type
           └─ Personalize with user's detected emotions
           └─ Add relevant emojis
           └─ Include context from actual entries
                │
                ▼
           "Based on your recent entries, you're showing 
            great enthusiasm about your project. That momentum 
            IS progress! 🚀"
```

## Data Model

```
RAGIndex Collection (MongoDB)
{
  _id: ObjectId,
  userId: ObjectId,           // User who wrote the entry
  entryId: ObjectId,          // Reference to Entry collection
  text: String,               // Full entry text
  embedding: [Number],        // 384-dimensional vector
  metadata: {
    date: Date,               // When entry was written
    mood: String,             // User's mood: "happy", "sad", etc
    tags: [String]            // User's tags: ["work", "goals"]
  },
  createdAt: Date             // When indexed
}
```

## Comparison: Before vs After

### BEFORE (Hugging Face)
```
Frontend Query
    ↓
Send to HF API (external)
    ├─ Wait for response (slow)
    ├─ Costs money per API call
    ├─ Generic response (no context)
    └─ Data leaves your system
    ↓
Generic Response
```

### AFTER (RAG)
```
Frontend Query
    ↓
Send to Local RAG API
    ├─ Instant (no network latency)
    ├─ Free (local processing)
    ├─ Personalized (uses YOUR data)
    └─ Private (stays on your server)
    ↓
Smart, Contextual Response
```

## Performance Characteristics

| Operation | Speed | Scalability |
|-----------|-------|------------|
| Embedding generation | ~1ms | O(n) where n = text length |
| Similarity search | ~10ms | O(m×k) where m = embeddings, k = dimensions |
| Response generation | <100ms | O(1) |
| **Total per query** | **~100-200ms** | Excellent |

vs Hugging Face API: 2-5 seconds (network dependent)

---

## Architecture Benefits

✅ **Low Latency** - Everything runs locally  
✅ **Privacy** - No external API calls  
✅ **Cost** - No API billing  
✅ **Reliability** - Doesn't depend on external services  
✅ **Customization** - Can add custom response logic  
✅ **Learning** - Can improve over time with more entries
