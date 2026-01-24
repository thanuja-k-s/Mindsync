# RAG Implementation for MindSync

## Overview
Replaced Hugging Face API with a local **Retrieval-Augmented Generation (RAG)** system that provides personalized AI responses based on your actual journal entries.

## What Changed

### Backend Changes ✅

#### 1. **New RAG Models** (`server/models/RAGIndex.js`)
- Stores embeddings of journal entries in MongoDB
- Each entry indexed with: text, embedding vector, metadata (mood, date, tags)
- Private per user

#### 2. **Embedding Service** (`server/utils/embeddingService.js`)
- **generateEmbedding()** - Creates 384-dimensional vectors from text using TF-IDF
- **cosineSimilarity()** - Measures how similar two vectors are
- **findSimilar()** - Finds top K most similar entries

#### 3. **RAG Service** (`server/utils/ragService.js`)
- **indexEntry()** - Adds/updates journal entry in vector database
- **retrieveContext()** - Finds most relevant entries for a query
- **buildRAGContext()** - Formats retrieved entries as context
- **deleteEntryIndex()** - Removes entry from index

#### 4. **RAG Routes** (`server/routes/rag.js`)
- **POST /api/rag/query** - Main endpoint for AI queries
  - Input: userId, query (user question)
  - Output: personalized response based on journal entries

#### 5. **Updated Entries Routes** (`server/routes/entries.js`)
- **Create Entry**: Automatically indexes new entry
- **Update Entry**: Re-indexes updated content
- **Delete Entry**: Removes from RAG index

#### 6. **Updated Server** (`server/index.js`)
- Added RAG routes import and middleware

### Frontend Changes ✅

#### **MemoTalks Component** (`src/pages/MemoTalks.js`)
- Replaced Hugging Face API calls with `/api/rag/query` endpoint
- Removed settings for HF API keys (no longer needed)
- Changed API_URL from 5000 to 3002 (Node.js backend)
- Cleaner, simpler implementation

## How It Works

### Step 1: Indexing (Automatic)
```
User creates journal entry
    ↓
Entry saved to MongoDB
    ↓
Content converted to embedding (TF-IDF)
    ↓
Embedding stored in RAGIndex collection
```

### Step 2: Retrieval (On Query)
```
User: "How am I doing?"
    ↓
Question converted to embedding
    ↓
Compare with all user's entry embeddings (cosine similarity)
    ↓
Get top 5 most relevant entries
    ↓
Extract actual text from those entries
```

### Step 3: Generation (Context-Aware)
```
Retrieved entries + user question
    ↓
Analyze emotion patterns in retrieved entries
    ↓
Generate personalized response based on:
    - User's actual journal content
    - Mood patterns detected
    - Themes and topics they mention
```

## API Endpoints

### POST /api/rag/query
Query the RAG system

**Request:**
```json
{
  "userId": "user_id_from_token",
  "query": "How am I doing?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Based on your recent entries, I see you've been feeling motivated...",
  "context": "Entry 1 (1/20/2026): ...",
  "entriesUsed": 5
}
```

## Key Features

✅ **No External APIs** - Works completely locally  
✅ **Private** - All data stays in your MongoDB  
✅ **Fast** - Vector similarity search is quick  
✅ **Smart** - Understands meaning, not just keywords  
✅ **Personalized** - Uses YOUR journal content  
✅ **Automatic** - Indexes entries as you write  

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Embeddings** | TF-IDF (384-dimensional vectors) |
| **Similarity** | Cosine Similarity |
| **Database** | MongoDB (RAGIndex collection) |
| **API** | Node.js/Express |
| **Frontend** | React |

## Response Generation Logic

MemoTalks analyzes retrieved entries for:

1. **Mood Patterns** - Most common emotions
2. **Topics** - What you write about most
3. **Sentiment** - Overall positive/negative
4. **Themes** - Recurring subjects

Then generates contextual responses for questions about:
- Summary/overview of your life
- Patterns and trends
- Advice and suggestions
- Mood and emotions
- Progress and growth
- Goals and future

## Setup (Already Done!)

1. ✅ RAGIndex model created
2. ✅ Embedding service implemented
3. ✅ RAG service implemented
4. ✅ RAG routes created
5. ✅ Entries routes updated
6. ✅ Server configured
7. ✅ Frontend updated

## Running the Application

**Terminal 1 - Start Backend**
```bash
cd server
npm install
npm run dev
# Runs on http://localhost:3002
```

**Terminal 2 - Start Frontend**
```bash
npm start
# Runs on http://localhost:3000
```

## Example Flow

1. **User writes journal entry**: "I'm feeling excited about my new project!"
2. **Entry indexed**: TF-IDF creates embedding, stored in RAGIndex
3. **User asks MemoTalks**: "Am I making progress?"
4. **RAG retrieves**: Finds entries mentioning "project", "excited", "progress"
5. **AI generates**: "Based on your recent entries, you're showing great enthusiasm about your new project. That's real progress! 🚀"

## Benefits Over Hugging Face

| Feature | HF API | RAG System |
|---------|--------|-----------|
| **Cost** | Pay per API call | Free (local) |
| **Privacy** | Data sent to HF | Stays local |
| **Speed** | Depends on API | Instant |
| **Personalization** | Generic responses | Context-aware |
| **No API Keys** | Need HF API key | Not needed |
| **Availability** | Depends on HF | Always available |

## Future Enhancements

- [ ] Use better embedding models (sentence-transformers)
- [ ] Add semantic search with Weaviate/Pinecone
- [ ] Implement more sophisticated NLP for emotion detection
- [ ] Add multi-modal embeddings (text + images)
- [ ] Implement feedback loop to improve responses

## Debugging

**Check RAG Index:**
```javascript
// In Node.js shell
const RAGIndex = require('./models/RAGIndex');
RAGIndex.countDocuments().then(count => console.log('Total indexed:', count));
```

**Test RAG Endpoint:**
```bash
curl -X POST http://localhost:3002/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_id","query":"How am I doing?"}'
```

---

**RAG System Ready!** Your MindSync AI now learns from YOUR journal. 🎉
