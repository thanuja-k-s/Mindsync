# MongoDB Backend Setup - Complete

## What's Been Created

### 1. **MongoDB Models** (`server/models/`)
- **User.js**: User account with secure password hashing using bcryptjs
- **Entry.js**: Journal entries with mood tracking and tags
- **Goal.js**: Goals with progress tracking and status management
- **Reminder.js**: Reminders with due dates and priority levels

### 2. **API Routes** (`server/routes/`)
- **auth.js**: Signup, login, profile management with JWT authentication
- **entries.js**: Full CRUD operations for journal entries
- **goals.js**: Full CRUD operations for goals
- **reminders.js**: Full CRUD operations for reminders

### 3. **Updated Server** (`server/index.js`)
- MongoDB connection with Mongoose
- All API routes integrated
- Health check endpoint
- Hugging Face proxy preserved for AI features

### 4. **Dependencies Added** (in `server/package.json`)
- `mongoose` (v7.0.0): MongoDB ODM
- `bcryptjs` (v2.4.3): Password hashing
- `jsonwebtoken` (v9.0.0): JWT authentication

## Setup Instructions

### Prerequisites
1. Install MongoDB locally or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Node.js and npm installed

### Installation Steps

1. **Install dependencies**:
```bash
cd server
npm install
```

2. **Configure environment**:
   - Create a `.env` file in the `server` directory:
```
MONGODB_URI=mongodb://localhost:27017/mindsync
JWT_SECRET=your-secret-key-change-in-production
HF_API_KEY=your-hugging-face-api-key
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.1
PORT=3002
```

3. **Start the server**:
```bash
npm run dev
```

Server will run on `http://localhost:3002`

## Next Steps

### To fully integrate with frontend, update:

1. **Auth flow** - Replace localStorage with API calls:
   - `POST /api/auth/signup` - Replace localStorage user storage
   - `POST /api/auth/login` - Replace localStorage authentication
   - Store JWT token in localStorage for subsequent requests

2. **Journal entries** - Replace localStorage with API:
   - `GET /api/entries/user/:userId` - Get all entries
   - `POST /api/entries` - Create entry
   - `PUT /api/entries/:entryId` - Update entry
   - `DELETE /api/entries/:entryId` - Delete entry

3. **Goals** - Replace localStorage with API:
   - `GET /api/goals/user/:userId` - Get all goals
   - `POST /api/goals` - Create goal
   - `PUT /api/goals/:goalId` - Update goal
   - `DELETE /api/goals/:goalId` - Delete goal

4. **Reminders** - Replace localStorage with API:
   - `GET /api/reminders/user/:userId` - Get all reminders
   - `POST /api/reminders` - Create reminder
   - `PUT /api/reminders/:reminderId` - Update reminder
   - `DELETE /api/reminders/:reminderId` - Delete reminder

## Database Collections

- **users** - User accounts with hashed passwords
- **entries** - Journal entries
- **goals** - Personal goals
- **reminders** - Task reminders

All data is automatically indexed by `userId` for efficient queries.

## API Response Format

All endpoints return JSON:

**Success**:
```json
{
  "id": "...",
  "field": "value",
  ...
}
```

**Error**:
```json
{
  "error": "Error message"
}
```

## Authentication

- Users receive JWT token on signup/login
- Store token in localStorage: `localStorage.setItem('authToken', token)`
- Include token in headers for protected routes:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

**Backend is now ready for integration!** See `server/BACKEND_SETUP.md` for detailed API documentation.
