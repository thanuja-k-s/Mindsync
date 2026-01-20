# MindSync Backend Server

Full-featured backend for MindSync with MongoDB integration.

## Features

- **User Management**: Signup, login, and profile management with secure password hashing
- **Journal Entries**: Create, read, update, and delete journal entries with mood tracking
- **Goals**: Track personal goals with progress and status
- **Reminders**: Manage reminders with due dates and priority levels
- **Hugging Face Integration**: AI-powered text generation for MemoTalks

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB:
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database called `mindsync`

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update values:
     ```
     MONGODB_URI=mongodb://localhost:27017/mindsync
     JWT_SECRET=your-secret-key-change-in-production
     HF_API_KEY=your-hugging-face-api-key
     PORT=3002
     ```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will start on `http://localhost:3002`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile/:userId` - Get user profile
- `PUT /api/auth/profile/:userId` - Update user profile

### Entries (Journal)
- `POST /api/entries` - Create new entry
- `GET /api/entries/user/:userId` - Get all entries for user
- `GET /api/entries/:entryId` - Get single entry
- `PUT /api/entries/:entryId` - Update entry
- `DELETE /api/entries/:entryId` - Delete entry

### Goals
- `POST /api/goals` - Create new goal
- `GET /api/goals/user/:userId` - Get all goals for user
- `GET /api/goals/:goalId` - Get single goal
- `PUT /api/goals/:goalId` - Update goal
- `DELETE /api/goals/:goalId` - Delete goal

### Reminders
- `POST /api/reminders` - Create new reminder
- `GET /api/reminders/user/:userId` - Get all reminders for user
- `GET /api/reminders/:reminderId` - Get single reminder
- `PUT /api/reminders/:reminderId` - Update reminder
- `DELETE /api/reminders/:reminderId` - Delete reminder

### Hugging Face AI
- `POST /api/hf` - Send prompt to AI model

## Database Models

### User
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Entry
```javascript
{
  userId: ObjectId (ref: User),
  title: String,
  content: String (required),
  mood: String (happy|sad|anxious|calm|excited|neutral),
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Goal
```javascript
{
  userId: ObjectId (ref: User),
  title: String (required),
  description: String,
  category: String (health|career|personal|finance|education|other),
  progress: Number (0-100),
  status: String (active|completed|paused),
  targetDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Reminder
```javascript
{
  userId: ObjectId (ref: User),
  title: String (required),
  description: String,
  dueDate: Date (required),
  priority: String (low|medium|high),
  completed: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Technologies Used

- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **cors**: CORS middleware
- **dotenv**: Environment variables
