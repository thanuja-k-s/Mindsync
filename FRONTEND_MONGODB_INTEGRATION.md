# Frontend to MongoDB Integration - Complete

## What's Been Updated

### 1. **Signup.js** - Now calls backend API
- Removed localStorage-only storage
- Added API call to `POST /api/auth/signup`
- Stores JWT token and user ID returned from backend
- Data is now saved to MongoDB!

### 2. **Auth.js** - Now calls backend API
- Removed CryptoJS hashing (backend handles it)
- Added API call to `POST /api/auth/login`
- Stores JWT token and user ID returned from backend
- Google Sign-In also uses backend API

### 3. **API_URL Configuration**
Both files now use:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
```

## How It Works Now

### Signup Flow
1. User enters username, email, password
2. Frontend validates locally
3. **Frontend sends to backend**: `POST http://localhost:5001/api/auth/signup`
4. Backend stores in MongoDB with password hashing
5. Backend returns JWT token + user ID
6. Frontend stores token in localStorage
7. User logged in ✅

### Login Flow
1. User enters username, password
2. **Frontend sends to backend**: `POST http://localhost:5001/api/auth/login`
3. Backend validates against MongoDB
4. Backend returns JWT token + user ID
5. Frontend stores token in localStorage
6. User logged in ✅

## Checking MongoDB Compass

After signing up/logging in:

1. **Open MongoDB Compass**
2. Connect to `mongodb://localhost:27017`
3. Select database `mindsync`
4. Go to collection `users`
5. **You should see your user data!**

### Example User Document:
```json
{
  "_id": ObjectId("..."),
  "username": "alex",
  "email": "alex@example.com",
  "password": "$2a$10$...",  // hashed by bcryptjs
  "createdAt": ISODate("2026-01-20T..."),
  "updatedAt": ISODate("2026-01-20T...")
}
```

## Troubleshooting

### Error: "Unable to connect to server"
- Check backend is running: `node D:\diaryAI\MindSync\server\index.js`
- Check port 5001 is open
- Check MongoDB connection

### Users not appearing in Compass
- Make sure you've actually signed up/logged in through the web app
- Refresh Compass (F5)
- Check in database `mindsync`, collection `users`

### Password looks like gibberish in MongoDB
- That's correct! It's hashed by bcryptjs
- Backend validates it automatically on login

## Next Steps

Update other pages to use backend API:
- [ ] **Entries.js** - Save journal entries to MongoDB
- [ ] **Goals.js** - Save goals to MongoDB  
- [ ] **Reminders.js** - Save reminders to MongoDB

All endpoints follow the same pattern:
```javascript
const response = await fetch(`${API_URL}/api/resource`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  body: JSON.stringify(data)
});
```
