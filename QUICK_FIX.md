# ✅ Personalization Troubleshooting Checklist

## Why MemoTalks is giving generic responses:

### Most Likely Issues (in order):

**1. ❌ No entries indexed in RAG database**
- [ ] Check MongoDB: `db.ragindexes.find()` - should have documents
- [ ] Check server logs when creating entry - should say "Indexing entry..."
- [ ] If empty: The indexEntry() call in entries.js might not be running

**2. ❌ userId mismatch**
- [ ] Check browser localStorage: `localStorage.getItem('user')`
- [ ] Check MongoDB stored userId: `db.ragindexes.distinct('userId')`
- [ ] They must match exactly (same case, same format)

**3. ❌ RAG API not being called**
- [ ] Open browser console (F12)
- [ ] Type question in MemoTalks
- [ ] Should see: `"Calling RAG API with userId: ..."`
- [ ] If not: userId extraction might be failing

**4. ❌ Backend not running properly**
- [ ] Terminal should show: `✓ Connected to MongoDB`
- [ ] No error messages about ports or connections
- [ ] If errors: Restart `npm run dev`

---

## Quick Test

### Test 1: Check if userId exists
```javascript
// In browser console (F12)
console.log('User:', localStorage.getItem('user'))
```
Should return your username, NOT a JSON object

### Test 2: Check if entries exist
```javascript
// In browser console
console.log('Entries:', localStorage.getItem('entries'))
```
Should show journal entries array

### Test 3: Check MongoDB
```bash
# In MongoDB shell or Compass
use mindsync
db.ragindexes.countDocuments()
```
Should return number > 0, NOT 0

---

## The Fix Usually Involves One of These:

**Option A: Restart and try again**
```bash
taskkill /F /IM node.exe
cd server && npm run dev
# In new terminal:
npm start
```

**Option B: Check entries are being indexed**
- Verify code in `server/routes/entries.js` has indexEntry call
- Look for logs like: `"Successfully indexed entry: ..."`

**Option C: Verify userId consistency**
- Make sure localStorage user is just string (username)
- Make sure MongoDB ragindexes has matching userId

**Option D: Check RAG API endpoint**
```bash
# Test directly from browser console:
fetch('http://localhost:3002/api/rag/query', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({userId: 'yourname', query: 'test'})
}).then(r => r.json()).then(d => console.log(d))
```
Should return: `{success: true, response: "...", entriesUsed: X}`

---

## What SHOULD Happen

```
Write Entry → Indexed (embedding created) → Ask Question → 
  RAG finds similar entries → Analyzes mood → Personalized response
```

If getting generic response → One step is broken

Use the console logs to find which step fails!

---

**Added detailed logging to help identify the issue. Check console logs!**
