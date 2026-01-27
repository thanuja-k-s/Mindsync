# MindSync - Complete Website Documentation

**Project Type**: Full-Stack AI-Powered Journaling Application  
**Version**: 1.0.0  
**Date**: January 27, 2026  

---

## Table of Contents

1. [Project Summary](#project-summary)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [RAG System](#rag-system)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [Frontend Pages](#frontend-pages)
8. [Security Features](#security-features)
9. [Technologies Used](#technologies-used)
10. [Setup & Deployment](#setup--deployment)

---

## Project Summary

**MindSync** is a full-stack web application that helps users track their daily life, emotions, and goals while providing personalized AI insights. The platform features an advanced RAG (Retrieval-Augmented Generation) system that learns from user journal entries to provide contextual, intelligent responses without requiring external AI services.

### Key Highlights
- ✅ Complete RAG AI system for intelligent responses
- ✅ MongoDB backend for persistent data storage
- ✅ React frontend with responsive UI
- ✅ Local AI learning from user journal entries
- ✅ No external AI APIs required for core functionality
- ✅ JWT-based secure authentication
- ✅ Dark/Light theme support
- ✅ Real-time analytics and insights

---

## Architecture

### Frontend Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 18.2.0 |
| Routing | React Router DOM | 7.9.6 |
| Charts | Chart.js & react-chartjs-2 | 4.5.1 / 5.3.1 |
| Encryption | Crypto-JS | 4.2.0 |
| Build Tool | React Scripts | 5.0.1 |
| **Server Port** | **localhost** | **3000/3001** |

**Project Structure**:
```
src/
├── App.js (main component with routing)
├── App.css (global styles)
├── index.js (entry point)
├── index.css (global CSS)
├── components/
│   ├── Header.js/Header.css
│   ├── Footer.js/Footer.css
│   ├── Nav.js/Nav.css
│   ├── Sidebar.js/Sidebar.css
│   └── SidebarToggle.js
├── contexts/ (React context for state management)
├── images/ (static assets)
├── pages/
│   ├── Auth.js
│   ├── Landing.js/Landing.css
│   ├── Signup.js/Signup.css
│   ├── Journaling.js/Journaling.css
│   ├── Entries.js/Entries.css
│   ├── MemoTalks.js/MemoTalks.css (AI companion)
│   ├── Goals.js/Goals.css
│   ├── Reminders.js/Reminders.css
│   ├── Insights.js (analytics dashboard)
│   └── Settings.js/Settings.css
└── styles/
    └── theme.css (dark/light theme)
```

### Backend Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | Latest |
| Framework | Express.js | 4.18.2 |
| Database | MongoDB | 7.0 |
| ODM | Mongoose | 7.0.0 |
| Authentication | JSON Web Token (JWT) | 9.0.0 |
| Password Hashing | bcryptjs | 2.4.3 |
| CORS | cors | 2.8.5 |
| Environment | dotenv | 16.0.0 |
| HTTP Client | node-fetch | 2.6.7 |
| Dev Tool | nodemon | 2.0.22 |
| **Server Port** | **localhost** | **3002** |

**Project Structure**:
```
server/
├── index.js (main server file)
├── package.json
├── .env (environment variables)
├── models/
│   ├── User.js (user schema)
│   ├── Entry.js (journal entry schema)
│   ├── Goal.js (goal schema)
│   ├── Reminder.js (reminder schema)
│   └── RAGIndex.js (AI embeddings schema)
├── routes/
│   ├── auth.js (authentication endpoints)
│   ├── entries.js (journal entry endpoints)
│   ├── goals.js (goal management endpoints)
│   ├── reminders.js (reminder endpoints)
│   └── rag.js (AI query endpoints)
└── utils/
    ├── embeddingService.js (TF-IDF embeddings)
    └── ragService.js (RAG operations)
```

### MongoDB Connection
- **Default URI**: `mongodb://localhost:27017/mindsync`
- **Environment Variable**: `MONGODB_URI`
- **Database Name**: `mindsync`

---

## Core Features

### 1. Authentication System 🔐

**Features**:
- User registration with email validation
- Secure login with JWT tokens
- Password hashing with bcryptjs
- Session management via localStorage
- Unique username and email validation

**Process**:
1. User registers with username, email, and password
2. Password hashed with bcryptjs (salted)
3. User stored in MongoDB
4. On login, password verified and JWT token generated
5. Token stored in localStorage for subsequent requests

---

### 2. Journal Writing / Journaling 📝

**Entry Model Fields**:
```javascript
{
  userId: ObjectId,           // Reference to user
  title: String,              // Optional entry title
  content: String,            // Required main text
  mood: String,               // One of: happy, sad, anxious, calm, excited, neutral
  tags: [String],             // Custom categorization tags
  images: [                   // Attached images
    {
      name: String,
      type: String,
      size: Number,
      dataUrl: String         // Base64 encoded image
    }
  ],
  files: [                    // Attached documents
    {
      name: String,
      type: String,
      size: Number,
      dataUrl: String         // Base64 encoded file
    }
  ],
  sentiment: String,          // AI-analyzed sentiment
  createdAt: Date,            // Creation timestamp
  updatedAt: Date             // Last modification timestamp
}
```

**Functionality**:
- ✅ Create new journal entries
- ✅ Edit existing entries
- ✅ Delete entries
- ✅ Add mood tracking (6 mood options)
- ✅ Add tags for organization
- ✅ Upload images and files
- ✅ Automatic RAG indexing on save
- ✅ View all entries
- ✅ Search and filter entries

**API Endpoints**:
- `POST /api/entries` - Create new entry (auto-indexes to RAG)
- `GET /api/entries` - Get all entries for user
- `GET /api/entries/:id` - Get specific entry
- `PUT /api/entries/:id` - Update entry (re-indexes to RAG)
- `DELETE /api/entries/:id` - Delete entry (removes from RAG)

---

### 3. MemoTalks AI Companion 💭

**Purpose**: Personal AI assistant that learns from your journal entries to provide personalized, contextual responses.

**How It Works**:
```
User Query → RAG Retrieval System
           ↓
     Find 5 Most Relevant Entries
           ↓
     Analyze Mood & Themes
           ↓
     Generate Contextual Response
           ↓
     Display in Chat Interface
```

**Features**:
- ✅ Conversational AI interface
- ✅ Access to all user's journal entries
- ✅ Memory of journal patterns
- ✅ 7 types of contextual responses:
  - Pattern summary responses
  - Emotional analysis
  - Growth and progress insights
  - Goal-oriented advice
  - Strength recognition
  - Personal reflection prompts
  - Advice based on history

**Response Types**:
1. **Pattern Summary**: "Based on your recent entries, I've noticed..."
2. **Emotional Analysis**: "Your emotional state seems to be..."
3. **Growth Insights**: "You've made progress in..."
4. **Goal Advice**: "Considering your goals, you should..."
5. **Strength Recognition**: "Your greatest strength is..."
6. **Reflection Prompt**: "Have you considered..."
7. **Contextual Advice**: "Given your experiences..."

**API Endpoint**:
- `POST /api/rag/query` - Main AI query endpoint
  - Request: `{ userId, query }`
  - Response: `{ response, context, confidence }`

---

### 4. Daily Entry Streak 🔥

**Purpose**: Gamify journaling and encourage consistent daily writing.

**Streak Model Fields**:
```javascript
{
  current: Number,            // Consecutive days of entries
  longest: Number,            // Personal best streak
  lastEntryDate: Date         // Date of last entry
}
```

**Logic**:
- Entry on consecutive days = streak increases
- Gap in entries = streak resets to 0
- Longest streak never decreases
- Automatically updated when creating entries
- Displays current and all-time best

**Tracking**:
- Checks `lastEntryDate` vs today
- If today's entry exists, streak continues
- If gap of 1+ days, streak resets
- Records day-level entry (not time-specific)

---

### 5. Goals Management 🎯

**Goal Model Fields**:
```javascript
{
  userId: ObjectId,           // Reference to user
  title: String,              // Goal title (required)
  description: String,        // Detailed description
  category: String,           // One of: health, career, personal, finance, education, other
  progress: Number,           // 0-100% completion
  status: String,             // One of: active, completed, paused
  targetDate: Date,           // Expected completion date
  createdAt: Date,
  updatedAt: Date
}
```

**Categories**:
- 🏥 **Health**: Fitness, wellness, nutrition goals
- 💼 **Career**: Professional development, job goals
- 👤 **Personal**: Self-improvement, hobbies
- 💰 **Finance**: Savings, investment goals
- 📚 **Education**: Learning, skill development
- 🔧 **Other**: Miscellaneous goals

**Functionality**:
- ✅ Create goals with category and target date
- ✅ Track progress (0-100%)
- ✅ Update status (active/completed/paused)
- ✅ Edit goal details
- ✅ Delete goals
- ✅ View all goals with filters

**API Endpoints**:
- `POST /api/goals` - Create new goal
- `GET /api/goals` - Get all goals
- `PUT /api/goals/:id` - Update goal progress/status
- `DELETE /api/goals/:id` - Delete goal

---

### 6. Reminders System ⏰

**Reminder Model Fields**:
```javascript
{
  userId: ObjectId,           // Reference to user
  title: String,              // Reminder title
  description: String,        // Details
  priority: String,           // Low, Medium, High
  dueDate: Date,              // When to remind
  status: String,             // Pending, Completed, Dismissed
  createdAt: Date,
  updatedAt: Date
}
```

**Functionality**:
- ✅ Create reminders with priority levels
- ✅ Set due dates and times
- ✅ Mark as completed
- ✅ Dismiss reminders
- ✅ Edit reminder details
- ✅ Delete reminders
- ✅ Priority-based sorting

**Priority Levels**:
- 🔴 **High**: Urgent tasks, deadlines
- 🟡 **Medium**: Important tasks
- 🟢 **Low**: Optional tasks

**API Endpoints**:
- `POST /api/reminders` - Create reminder
- `GET /api/reminders` - Get all reminders
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

---

### 7. Insights Dashboard 📊

**Features**:
- ✅ Visual charts using Chart.js
- ✅ Mood trends over time
- ✅ Journaling patterns analysis
- ✅ Entry frequency statistics
- ✅ Historical data visualization
- ✅ Mood distribution pie charts
- ✅ Entry count bar charts
- ✅ Trend line graphs

**Visualizations**:
1. **Mood Distribution**: Pie chart of mood frequencies
2. **Entry Frequency**: Bar chart of entries per week/month
3. **Mood Trends**: Line graph showing emotional patterns
4. **Productivity Stats**: Total entries, average entries per day
5. **Most Common Mood**: Highlighted mood statistic
6. **Entry Timeline**: Chronological entry summary

**Data Points**:
- Total entries created
- Average entries per day
- Most frequent mood
- Least frequent mood
- Entries this week/month
- Current and longest streak

---

### 8. Settings & Preferences ⚙️

**Features**:
- ✅ Dark/Light theme toggle 🌙☀️
- ✅ Persistent theme preference
- ✅ Profile information management
- ✅ Account settings
- ✅ Privacy options
- ✅ Notification preferences

**Theme System**:
- **Light Theme**: Bright, clean interface (default)
- **Dark Theme**: Eye-friendly dark mode
- **Persistence**: Theme choice saved in localStorage
- **CSS Variables**: Dynamic theme switching
- **Coverage**: Entire UI theme changes (header, sidebar, content, footer)

**Settings Managed**:
- Theme preference
- Notification settings
- Privacy settings
- Account information
- Password management

---

## RAG System

### What is RAG?

RAG (Retrieval-Augmented Generation) combines:
1. **Retrieval**: Finding relevant information from stored entries
2. **Augmentation**: Using that information to enhance AI responses
3. **Generation**: Creating personalized, contextual responses

### RAG Architecture

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

### Entry Indexing Flow

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
        │                         │
        │                    Store in                        │
        │                    RAGIndex with                   │
        │                    metadata                        │
        │                    (mood, tags, date)              │
```

### Embedding Service

**TF-IDF Algorithm**:
- **TF** (Term Frequency): How often a word appears in the document
- **IDF** (Inverse Document Frequency): How rare the word is across all documents
- **Result**: 384-dimensional vector representing entry content

**Process**:
1. Tokenize text into words
2. Calculate TF for each word
3. Calculate IDF for each word
4. Multiply TF × IDF for each word
5. Normalize to unit vector
6. Store as 384-dimensional array

**Similarity Calculation**:
- **Cosine Similarity**: Measures angle between vectors
- Range: -1 to 1 (1 = identical, 0 = orthogonal, -1 = opposite)
- Used to find most relevant entries to query

### RAG Service Methods

```javascript
// Add new entry to RAG index
indexEntry(userId, entryId, text, metadata)
  → Generates embedding
  → Creates RAGIndex document
  → Stores in MongoDB

// Find relevant entries for query
retrieveContext(userId, query, topK=5)
  → Generates embedding for query
  → Fetches all user's RAGIndex entries
  → Calculates similarity to each
  → Returns top K most similar
  → Includes: text, mood, date, tags

// Remove entry from index
deleteEntryIndex(entryId)
  → Removes RAGIndex document
  → Called when entry is deleted

// Build context for response
buildRAGContext(entries, query)
  → Formats retrieved entries
  → Extracts mood patterns
  → Summarizes themes
  → Returns structured context
```

### Query Endpoint

```javascript
POST /api/rag/query
Request: {
  userId: "user-id",
  query: "How am I doing?"
}

Response: {
  response: "Based on your recent entries...",
  context: {
    moods: ["happy", "excited", "calm"],
    themes: ["success", "growth", "relationships"],
    recentEntries: 5
  },
  confidence: 0.85,
  sources: [
    {
      date: "2026-01-25",
      mood: "happy",
      preview: "Had a great day..."
    },
    // ... more entries
  ]
}
```

---

## Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  username: String (unique, 3+ chars, required),
  email: String (unique, validated, required),
  password: String (hashed, 6+ chars, required),
  streak: {
    current: Number (default: 0),
    longest: Number (default: 0),
    lastEntryDate: Date (nullable)
  },
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Indexes**:
- `username` (unique)
- `email` (unique)

---

### Entry Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  title: String (optional),
  content: String (required),
  mood: String (enum: ['happy', 'sad', 'anxious', 'calm', 'excited', 'neutral'], default: 'neutral'),
  tags: [String],
  images: [
    {
      name: String,
      type: String,
      size: Number,
      dataUrl: String (base64)
    }
  ],
  files: [
    {
      name: String,
      type: String,
      size: Number,
      dataUrl: String (base64)
    }
  ],
  sentiment: String (optional),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Indexes**:
- `userId` (for fast user queries)
- `createdAt` (for chronological sorting)
- `mood` (for mood filtering)

---

### RAGIndex Model

```javascript
{
  _id: ObjectId,
  userId: String (required, indexed),
  entryId: ObjectId (ref: Entry, required, indexed),
  text: String (required, the entry content),
  embedding: [Number] (384-dimensional TF-IDF vector),
  metadata: {
    date: Date (default: now, indexed),
    mood: String (default: 'neutral', indexed),
    tags: [String]
  },
  createdAt: Date (default: now, indexed)
}
```

**Indexes**:
- `userId` (find user's entries)
- `entryId` (find specific entry's embedding)
- `userId` + `createdAt` (recent entries for user)
- `userId` + `metadata.mood` (mood-based queries)

---

### Goal Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  title: String (required),
  description: String (optional),
  category: String (enum: ['health', 'career', 'personal', 'finance', 'education', 'other'], default: 'other'),
  progress: Number (0-100, default: 0),
  status: String (enum: ['active', 'completed', 'paused'], default: 'active'),
  targetDate: Date (optional),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Indexes**:
- `userId` (find user's goals)
- `status` (filter by status)
- `category` (filter by category)

---

### Reminder Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  title: String (required),
  description: String (optional),
  priority: String (enum: ['low', 'medium', 'high'], default: 'medium'),
  dueDate: Date (required),
  status: String (enum: ['pending', 'completed', 'dismissed'], default: 'pending'),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

**Indexes**:
- `userId` (find user's reminders)
- `dueDate` (sort by due date)
- `status` (filter by status)

---

## API Routes

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/auth/signup` | Register new user | `{ username, email, password }` | `{ userId, token }` |
| POST | `/auth/login` | Login user | `{ email, password }` | `{ userId, token, user }` |
| GET | `/auth/profile` | Get user profile | Headers: `Authorization: Bearer {token}` | `{ user }` |

### Entry Routes (`/api/entries`)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/entries` | Create entry | `{ title, content, mood, tags, images, files }` | `{ entryId, createdAt }` |
| GET | `/entries` | Get all entries | Query: `limit, skip, mood, tag` | `{ entries[], total }` |
| GET | `/entries/:id` | Get specific entry | URL param: `id` | `{ entry }` |
| PUT | `/entries/:id` | Update entry | `{ title, content, mood, tags }` | `{ updatedEntry }` |
| DELETE | `/entries/:id` | Delete entry | URL param: `id` | `{ message: "Deleted" }` |
| POST | `/entries/:id/share` | Share entry | `{ sharedWith }` | `{ shareId }` |

### Goal Routes (`/api/goals`)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/goals` | Create goal | `{ title, description, category, targetDate }` | `{ goalId, createdAt }` |
| GET | `/goals` | Get all goals | Query: `status, category` | `{ goals[], total }` |
| GET | `/goals/:id` | Get specific goal | URL param: `id` | `{ goal }` |
| PUT | `/goals/:id` | Update goal | `{ progress, status, description }` | `{ updatedGoal }` |
| DELETE | `/goals/:id` | Delete goal | URL param: `id` | `{ message: "Deleted" }` |

### Reminder Routes (`/api/reminders`)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/reminders` | Create reminder | `{ title, description, priority, dueDate }` | `{ reminderId, createdAt }` |
| GET | `/reminders` | Get all reminders | Query: `status, priority` | `{ reminders[], total }` |
| GET | `/reminders/:id` | Get specific reminder | URL param: `id` | `{ reminder }` |
| PUT | `/reminders/:id` | Update reminder | `{ title, status, priority }` | `{ updatedReminder }` |
| DELETE | `/reminders/:id` | Delete reminder | URL param: `id` | `{ message: "Deleted" }` |

### RAG Routes (`/api/rag`)

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/rag/query` | Query AI companion | `{ userId, query }` | `{ response, context, sources }` |
| GET | `/rag/index/status` | Check RAG index | Query: `userId` | `{ entryCount, lastUpdated }` |
| DELETE | `/rag/index/:entryId` | Remove from index | URL param: `entryId` | `{ message: "Removed" }` |

### System Routes

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/health` | Health check | `{ status: "OK", message: "..." }` |
| POST | `/api/hf` | Hugging Face proxy | `{ result }` |

---

## Frontend Pages

### 1. Landing Page (`/`)

**Purpose**: Welcome page for unauthenticated users

**Features**:
- Project description
- Call-to-action buttons (Login, Signup)
- Feature highlights
- Responsive design
- Navigation to Auth/Signup

**Components Used**:
- Hero section
- Feature cards
- CTA buttons
- Footer

---

### 2. Auth Page (`/auth`)

**Purpose**: User login

**Features**:
- Email input field
- Password input field
- "Remember me" option
- Login button
- Link to signup page
- Error handling
- Form validation

**Flow**:
1. User enters email and password
2. Submit to `/api/auth/login`
3. Receive JWT token
4. Store in localStorage
5. Redirect to `/journal`

---

### 3. Signup Page (`/signup`)

**Purpose**: New user registration

**Features**:
- Username input (3+ chars)
- Email input (validated)
- Password input (6+ chars)
- Confirm password
- Terms acceptance checkbox
- Signup button
- Link to login page
- Error messages

**Flow**:
1. User fills registration form
2. Validate inputs
3. Submit to `/api/auth/signup`
4. Account created
5. Auto-login and redirect to `/journal`

---

### 4. Journaling Page (`/journal` or `/journaling`)

**Purpose**: Create and edit journal entries

**Features**:
- Rich text editor for content
- Title input field
- Mood selector (6 options)
- Tag input (add/remove tags)
- Image upload
- File upload
- Auto-save functionality
- Save button
- Cancel/Go back option
- Preview mode

**Editor Capabilities**:
- Text formatting (bold, italic, underline)
- Lists (numbered, bulleted)
- Headings
- Links
- Code blocks
- Character count

**Flow**:
1. User writes entry content
2. Selects mood
3. Adds tags
4. Uploads media (optional)
5. Click save
6. Entry created and indexed to RAG
7. Streak updated
8. Confirmation message

---

### 5. Entries Page (`/entries`)

**Purpose**: View, search, and manage all journal entries

**Features**:
- List view of all entries
- Search functionality (by title, content, tags)
- Filter by mood
- Filter by date range
- Sort options (newest, oldest, by mood)
- Entry preview cards
- Edit entry link
- Delete entry button
- Entry count display
- Pagination

**Entry Card Shows**:
- Title
- Date
- Mood icon
- Tags
- Content preview (first 100 chars)
- Edit/Delete buttons

**Interactions**:
- Click to view full entry
- Edit existing entry
- Delete entry (with confirmation)
- Search entries
- Filter by mood/date/tag

---

### 6. MemoTalks Page (`/sage`)

**Purpose**: AI companion chat interface

**Features**:
- Chat message display
- Message input field
- Send button
- Loading indicator
- Auto-scroll to latest message
- Message history display
- Clear conversation option
- Markdown support in responses
- Source citations (entries used for response)

**Chat Interactions**:
1. User types question
2. Click send or press Enter
3. Show loading spinner
4. API queries RAG system
5. Get contextual response
6. Display response in chat
7. Show sources used

**Example Conversations**:
- "How have I been feeling lately?"
- "What are my main concerns?"
- "How can I achieve my goals?"
- "Tell me about my progress"
- "What patterns do you see in my entries?"

---

### 7. Insights Page (`/insights`)

**Purpose**: Analytics dashboard with visualizations

**Features**:
- Mood distribution chart (pie)
- Entry frequency chart (bar)
- Mood trends chart (line)
- Mood statistics cards
- Entry statistics
- Most common mood
- Least common mood
- Total entries count
- Average entries per day
- Current and longest streak
- Time period selector (week, month, all-time)
- Export data option

**Visualizations**:
- Chart.js pie charts
- Chart.js bar charts
- Chart.js line charts
- Stat cards with icons
- Date-based filtering

---

### 8. Goals Page (`/goals`)

**Purpose**: Create and track personal goals

**Features**:
- Create new goal form
- Goal list display
- Goal cards with:
  - Title and description
  - Category badge
  - Progress bar
  - Status indicator
  - Target date
  - Edit button
  - Delete button
- Filter by category
- Filter by status
- Progress update slider
- Status change dropdown
- Goal completion marking

**Goal Form Fields**:
- Title (required)
- Description (optional)
- Category (dropdown)
- Target date (date picker)
- Initial progress (0%)

**Actions**:
- Create new goal
- Update progress
- Change status
- Edit goal details
- Delete goal

---

### 9. Reminders Page (`/reminders`)

**Purpose**: Set and manage reminders

**Features**:
- Create new reminder form
- Reminder list display
- Reminder cards with:
  - Title and description
  - Priority indicator (color-coded)
  - Due date
  - Status
  - Edit button
  - Delete button
  - Mark complete button
- Filter by priority
- Filter by status
- Sort by due date
- Upcoming reminders section

**Reminder Form Fields**:
- Title (required)
- Description (optional)
- Priority (dropdown: Low/Medium/High)
- Due date (date picker)
- Time (time picker)

**Actions**:
- Create reminder
- Mark as completed
- Edit reminder
- Delete reminder
- Dismiss reminder

---

### 10. Settings Page (`/settings`)

**Purpose**: User preferences and account settings

**Features**:
- Theme toggle (Dark/Light)
- Theme preview
- Account information display
- Change password option
- Profile customization
- Privacy settings
- Notification preferences
- Data export option
- Account deletion option (with confirmation)

**Sections**:
1. **Theme Settings**: Dark/Light toggle, preview
2. **Account**: Username, email display, change password
3. **Privacy**: Data privacy settings
4. **Notifications**: Alert preferences
5. **Data**: Export/import options

---

## Security Features

### Authentication Security

1. **JWT (JSON Web Tokens)**
   - Issued on successful login
   - Stored in localStorage (frontend)
   - Included in API requests via Authorization header
   - Verified on backend for protected routes

2. **Password Hashing**
   - bcryptjs library with salt rounds (10)
   - Passwords never stored in plain text
   - Hashing performed before storage
   - Verified on login via bcrypt compare

3. **CORS (Cross-Origin Resource Sharing)**
   - Configured on backend
   - Allows frontend on port 3000/3001
   - Restricts unauthorized access

### Data Security

1. **User Data Isolation**
   - All queries filtered by userId
   - Users can only access their own data
   - Backend validates userId on all operations

2. **Entry Privacy**
   - Entries associated with specific user
   - RAG index scoped to user
   - Cannot access other users' entries

3. **Password Security**
   - Minimum 6 characters
   - Email validation
   - No password in logs or error messages

### API Security

1. **Input Validation**
   - Email format validation
   - Username length validation
   - Content type validation
   - File size limits (50MB)

2. **Error Handling**
   - Generic error messages to users
   - Detailed logs for debugging
   - No sensitive data in error responses

3. **Rate Limiting** (Recommended)
   - Prevent brute force attacks
   - Limit API calls per user
   - Cooldown periods

### Environment Security

1. **Environment Variables**
   - MongoDB URI
   - Hugging Face API key
   - JWT secret
   - Port configuration

2. **Sensitive Data**
   - Never commit `.env` file
   - Use `.env.example` template
   - Rotate API keys regularly

---

## Technologies Used

### Frontend Technologies

| Category | Technologies |
|----------|---------------|
| **Framework** | React 18.2.0 |
| **Routing** | React Router DOM 7.9.6 |
| **Visualization** | Chart.js 4.5.1, react-chartjs-2 5.3.1 |
| **Security** | Crypto-JS 4.2.0 |
| **Build** | React Scripts 5.0.1 |
| **Storage** | localStorage (browser storage) |
| **Language** | JavaScript (ES6+) |
| **Styling** | CSS3 (custom, responsive) |

### Backend Technologies

| Category | Technologies |
|----------|---------------|
| **Runtime** | Node.js |
| **Framework** | Express.js 4.18.2 |
| **Database** | MongoDB 7.0 |
| **ODM** | Mongoose 7.0.0 |
| **Authentication** | JWT 9.0.0 |
| **Password** | bcryptjs 2.4.3 |
| **Middleware** | cors 2.8.5 |
| **Config** | dotenv 16.0.0 |
| **HTTP** | node-fetch 2.6.7 |
| **Dev Tool** | nodemon 2.0.22 |
| **Language** | JavaScript (Node.js) |

### AI/ML Technologies

| Component | Technology |
|-----------|-----------|
| **Text Embedding** | TF-IDF (384 dimensions) |
| **Similarity** | Cosine Similarity |
| **Retrieval** | Vector-based search |
| **Response** | Template-based generation |

### Database

| Aspect | Technology |
|--------|-----------|
| **Database** | MongoDB (NoSQL) |
| **Connection** | Mongoose ODM |
| **Collections** | Users, Entries, Goals, Reminders, RAGIndex |
| **Indexing** | Multiple compound indexes |
| **Storage** | Local or cloud (Atlas) |

### DevOps & Deployment

| Category | Tools |
|----------|-------|
| **Version Control** | Git, GitHub |
| **Package Manager** | npm (frontend & backend) |
| **Environment** | .env configuration |
| **Development** | nodemon (auto-reload) |
| **Build** | React build, npm scripts |

---

## Setup & Deployment

### Prerequisites

- **Node.js**: v14+ installed
- **MongoDB**: Local or cloud (Atlas)
- **npm**: v6+ installed
- **Git**: For version control

### Installation Steps

#### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
# Add the following:
# MONGODB_URI=mongodb://localhost:27017/mindsync
# PORT=3002
# JWT_SECRET=your-secret-key
# HF_API_KEY=your-hugging-face-key (optional)

# Start development server
npm run dev

# Or production
npm start
```

#### Frontend Setup

```bash
# Navigate to root directory
cd ..

# Install dependencies
npm install

# Create .env file (optional)
# REACT_APP_API_URL=http://localhost:3002

# Start development server
npm start

# Build for production
npm build
```

### Running the Application

**Terminal 1 - Backend**:
```bash
cd server
npm run dev
# Server runs on http://localhost:3002
```

**Terminal 2 - Frontend**:
```bash
npm start
# Frontend runs on http://localhost:3000 (or 3001)
```

### Environment Variables

#### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/mindsync
PORT=3002
JWT_SECRET=your-jwt-secret-key-here
HF_API_KEY=your-hugging-face-api-key-here
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.1
NODE_ENV=development
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3002
```

### MongoDB Setup

#### Local MongoDB
```bash
# Start MongoDB service
mongod

# Connect to local database
# Default: mongodb://localhost:27017/mindsync
```

#### MongoDB Atlas (Cloud)
```
1. Create account at mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Add to MONGODB_URI in .env
```

### Production Deployment

#### Build Frontend
```bash
npm run build
# Creates optimized build in build/ directory
```

#### Deploy Options

1. **Heroku**
   - Push repository to Heroku
   - Set environment variables
   - Automatic deployment

2. **Vercel**
   - Frontend hosting
   - Auto-deploy from GitHub
   - Serverless functions

3. **AWS/GCP/Azure**
   - Container deployment
   - Kubernetes orchestration
   - Managed databases

4. **Self-Hosted**
   - VPS or dedicated server
   - Docker containerization
   - nginx reverse proxy
   - SSL certificates

---

## Project Statistics

| Metric | Value |
|--------|-------|
| **Frontend Components** | 10+ pages |
| **Backend Routes** | 5+ route groups |
| **Database Collections** | 5 (User, Entry, Goal, Reminder, RAGIndex) |
| **API Endpoints** | 20+ |
| **Features** | 8+ major features |
| **Languages** | JavaScript (Frontend + Backend) |
| **Database** | MongoDB |
| **Authentication** | JWT + bcryptjs |

---

## Common Use Cases

### 1. Daily Journaling
- User writes entry in morning/evening
- Auto-indexed to RAG
- Streak updated
- Later, review via Entries page

### 2. Reflection & Insights
- User asks MemoTalks "How have I been?"
- RAG retrieves relevant entries
- AI generates personalized response
- User gains emotional insights

### 3. Goal Tracking
- User sets quarterly goals
- Tracks progress monthly
- Views goal-related reminders
- Celebrates completions

### 4. Mood Analysis
- User views Insights dashboard
- Sees mood distribution
- Identifies patterns
- Plans for emotional wellness

### 5. Reminder Management
- User sets daily reminders
- Gets notifications
- Marks as completed
- Tracks habits

---

## Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
Solution: 
- Ensure MongoDB is running (mongod)
- Check connection string in .env
- For Atlas, whitelist IP address
```

#### Port Already in Use
```
Error: listen EADDRINUSE :::3002
Solution:
- Change PORT in .env
- Kill process using port: lsof -i :3002
- Use different port: PORT=3003 npm start
```

#### JWT Token Error
```
Error: jwt malformed
Solution:
- Clear localStorage in browser
- Login again to get new token
- Check JWT_SECRET in .env
```

#### RAG Not Finding Entries
```
Solution:
- Ensure entries are created first
- Check RAGIndex collection in MongoDB
- Verify userId is correctly passed
- Check entry has content
```

---

## Future Enhancements

1. **Voice Integration**
   - Record voice entries
   - Speech-to-text conversion
   - Voice-based queries

2. **Mobile App**
   - React Native mobile app
   - Push notifications
   - Offline access

3. **Advanced Analytics**
   - Machine learning insights
   - Predictive mood analysis
   - Recommendation engine

4. **Social Features**
   - Share entries with friends
   - Collaborative goals
   - Community insights

5. **Integration**
   - Calendar sync
   - Email reminders
   - Third-party APIs

6. **Performance**
   - Caching layer (Redis)
   - Image optimization
   - Database query optimization

---

## License & Credits

- **Framework**: React.js
- **Backend**: Express.js, Node.js
- **Database**: MongoDB, Mongoose
- **Charts**: Chart.js
- **Security**: bcryptjs, JWT

---

## Contact & Support

For issues, feature requests, or contributions:
- Create GitHub issue
- Submit pull request
- Email support

---

## Document Information

- **Created**: January 27, 2026
- **Version**: 1.0.0
- **Status**: Complete
- **Author**: MindSync Team
- **Last Updated**: January 27, 2026

---

**End of Documentation**

This comprehensive guide covers all aspects of the MindSync application, from architecture to deployment. For specific implementation details, refer to source code comments and individual route/component documentation.
