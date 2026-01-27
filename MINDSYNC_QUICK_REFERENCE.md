# MindSync - Features & Technologies (Quick Reference)

## 🎯 FEATURES

### Core Features
✅ **User Authentication** - Login/Signup with JWT & bcryptjs  
✅ **Journal Writing** - Create, edit, delete entries with mood & tags  
✅ **Entry Management** - View all entries, search, filter by mood/date  
✅ **MemoTalks AI** - AI companion using RAG system (learns from your entries)  
✅ **Daily Streak** - Track consecutive journaling days  
✅ **Goals Tracking** - Create goals by category (health, career, finance, etc.)  
✅ **Reminders** - Set reminders with priority levels (Low/Medium/High)  
✅ **Insights Dashboard** - Charts & analytics of mood trends & patterns  
✅ **Dark/Light Theme** - Toggle theme with persistent preference  
✅ **Media Support** - Upload images & files to entries  

---

## 🛠️ TECHNOLOGIES USED

### Frontend
- **React** 18.2.0
- **React Router DOM** 7.9.6
- **Chart.js** 4.5.1 (data visualization)
- **react-chartjs-2** 5.3.1
- **Crypto-JS** 4.2.0 (encryption)
- **CSS3** (responsive styling)
- **localStorage** (client-side storage)

### Backend
- **Node.js** (JavaScript runtime)
- **Express.js** 4.18.2 (REST API)
- **MongoDB** 7.0 (database)
- **Mongoose** 7.0.0 (database ORM)
- **JWT** 9.0.0 (authentication)
- **bcryptjs** 2.4.3 (password hashing)
- **CORS** 2.8.5 (cross-origin requests)
- **dotenv** 16.0.0 (environment config)

### AI/ML
- **TF-IDF** - Text embedding (384 dimensions)
- **Cosine Similarity** - Text similarity matching
- **RAG (Retrieval-Augmented Generation)** - Context-aware AI responses

### Database Collections
1. **Users** - usernames, emails, passwords, streaks
2. **Entries** - journal entries with mood, tags, media
3. **Goals** - personal goals with progress tracking
4. **Reminders** - reminders with due dates
5. **RAGIndex** - entry embeddings for AI search

---

## 📊 API ENDPOINTS

**Authentication**: `/api/auth/login`, `/api/auth/signup`  
**Entries**: `POST/GET/PUT/DELETE /api/entries`  
**Goals**: `POST/GET/PUT/DELETE /api/goals`  
**Reminders**: `POST/GET/PUT/DELETE /api/reminders`  
**AI**: `POST /api/rag/query` (MemoTalks)  
**Health**: `GET /health`  

---

## 🎨 PAGES (Routes)

| Page | Route | Function |
|------|-------|----------|
| Landing | `/` | Welcome page |
| Login | `/auth` | User authentication |
| Signup | `/signup` | New user registration |
| Journaling | `/journal` | Write/edit entries |
| Entries | `/entries` | View all entries |
| MemoTalks | `/sage` | AI companion chat |
| Insights | `/insights` | Analytics dashboard |
| Goals | `/goals` | Goal management |
| Reminders | `/reminders` | Reminder management |
| Settings | `/settings` | Theme & preferences |

---

## 🔒 SECURITY

- JWT token-based authentication
- bcryptjs password hashing
- User data isolation (can only access own data)
- CORS protection
- Input validation
- Environment variables for sensitive data

---

## 💾 DEPLOYMENT

**Frontend Port**: 3000/3001  
**Backend Port**: 3002  
**Database**: MongoDB (local or Atlas cloud)  
**Build**: `npm build` (optimized React build)  

---

**Summary**: Full-stack MERN app with AI-powered journaling, goal tracking, reminders, and mood analytics.
