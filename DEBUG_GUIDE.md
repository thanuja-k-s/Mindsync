# 🔍 RAG Debugging Guide

## Problem: Generic Responses Instead of Personalized Ones

If MemoTalks is giving generic fallback responses instead of personalized ones based on your journal, follow this guide.

---

## Step 1: Check Browser Console

**Open Developer Tools** (F12 or Ctrl+Shift+I)

### Look for logs from MemoTalks:
```
✅ Should see:
"Calling RAG API with userId: <username> query: your question"
"RAG API Response status: 200"
"RAG Response: {success: true, response: "...", entriesUsed: 5}"

❌ If you see:
"No userId found, using fallback"
"RAG API Error: 404/500"
"Falling back to local response generation"
```

---

## Step 2: Check Server Console

**Look at terminal running: `npm run dev`**

### Should see logs like:
```
RAG Query received - userId: brindha query: how am I doing
Retrieved 3 indexed entries for userId: brindha
Found 2 similar entries
```

### If you see:
```
Retrieved 0 indexed entries for userId: brindha
```
→ **Entries are NOT being indexed! See Step 3**

---

## Step 3: Verify Entries Are Being Indexed

### When you create a journal entry, you should see in server console:
```
Indexing entry - userId: brindha entryId: 507f1f77bcf86cd799439011 text length: 245
Creating new RAG index for entry: 507f1f77bcf86cd799439011
Successfully indexed entry: 507f1f77bcf86cd799439011
```

### If NOT seeing these logs:
1. Check if journal entry is actually being saved
2. Verify backend is connected to MongoDB
3. Look for errors in server console

---

## Step 4: Check MongoDB Directly

### Open MongoDB and check RAG index collection:

```javascript
// Connect to MongoDB shell/compass
db.ragindexes.find().limit(5)

// Should see documents like:
{
  _id: ObjectId(...),
  userId: "brindha",
  entryId: ObjectId(...),
  text: "My journal entry text...",
  embedding: [0.1, 0.2, 0.3, ...],
  metadata: { date: Date, mood: "happy", tags: [...] }
}
```

**If empty → Indexing is not working**

---

## Step 5: Common Issues & Solutions

### Issue 1: "No userId found"
**Cause:** User not logged in or userId not stored in localStorage

**Fix:**
1. Check browser localStorage (F12 → Application → Storage → localStorage)
2. Look for `user` key with username value
3. Login again if missing
4. Check if Auth.js properly stores user

### Issue 2: "Retrieved 0 entries"
**Cause:** Entries not indexed OR userId mismatch

**Fix:**
```javascript
// In browser console, check localStorage:
console.log('userId:', localStorage.getItem('user'))

// In MongoDB, check what userId values exist:
db.ragindexes.distinct('userId')
```

**If different formats (ObjectId vs string):**
→ Need to normalize userId in entries.js

### Issue 3: "RAG API returns 500 error"
**Cause:** Backend error during retrieval

**Fix:**
1. Check server console for error message
2. Verify MongoDB connection
3. Ensure RAGIndex model is properly defined
4. Check if embeddingService is working

---

## Step 6: Verify MongoDB Connection

### In server index.js, you should see:
```
✓ Connected to MongoDB
```

If not:
```bash
# Check .env has correct MONGODB_URI
cat .env

# Default should work:
MONGODB_URI=mongodb://localhost:27017/mindsync
```

---

## Step 7: Test RAG API Directly

### In browser console, test the API:
```javascript
fetch('http://localhost:3002/api/rag/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'brindha',
    query: 'how am I doing'
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

**Should return:**
```json
{
  "success": true,
  "response": "Personalized response...",
  "entriesUsed": 3
}
```

---

## Step 8: Check Entry Indexing is Enabled

**In `server/routes/entries.js`, after entry creation:**

Should see this code:
```javascript
// Index entry into RAG system
await indexEntry(userId, entry._id, content, { 
  date: entry.createdAt,
  mood: mood || 'neutral',
  tags: tags || []
});
```

If missing → Add it!

---

## Debugging Checklist

- [ ] Browser console shows RAG API being called
- [ ] Server console shows "RAG Query received"
- [ ] Server console shows "Retrieved X entries"
- [ ] MongoDB has documents in ragindexes collection
- [ ] userId is consistent (same format everywhere)
- [ ] Entry indexing logs appear when creating entries
- [ ] No error messages in either console

---

## Quick Restart

If stuck, do a full restart:

```bash
# 1. Kill all Node processes
taskkill /F /IM node.exe

# 2. Restart backend
cd server && npm run dev

# 3. In another terminal, restart frontend
npm start

# 4. Clear browser cache (Ctrl+Shift+Delete)

# 5. Login again and create new entry

# 6. Check console logs
```

---

## Expected Flow

1. **Write journal entry**
   - Entry created in MongoDB
   - Server logs: "Indexing entry..."
   - RAGIndex document created

2. **Ask MemoTalks question**
   - Browser logs: "Calling RAG API..."
   - Server logs: "RAG Query received..."
   - Server logs: "Retrieved X entries"
   - Gets personalized response

3. **Next question**
   - All logs repeat but finds already-indexed entries
   - Response gets better with more entries

---

## Need More Help?

Check these files for issues:
- `src/pages/MemoTalks.js` - Check userId extraction
- `server/routes/rag.js` - Check query response
- `server/routes/entries.js` - Check auto-indexing
- `server/utils/ragService.js` - Check context retrieval
- `server/models/RAGIndex.js` - Check schema definition

---

**Good luck debugging! The logs will tell you exactly what's happening.** 🔍
