# Image & Files Storage in MongoDB - Complete ✅

## What's Been Updated

### 1. **Entry Model** (`server/models/Entry.js`)
- Added `images` array to store image data with base64 encoding
- Added `files` array to store other files (videos, PDFs, etc.)
- Added `sentiment` field to track mood
- Each image/file includes: name, type, size, and base64 `dataUrl`

### 2. **Entries API** (`server/routes/entries.js`)
- Updated `POST /api/entries` to accept and store `images` and `files`
- Updated `PUT /api/entries/:id` to handle image/file updates
- Separates images from other files automatically

### 3. **Journaling.js** (Frontend)
- ✅ Now calls backend API: `POST http://localhost:5001/api/entries`
- ✅ Converts images to base64 before sending to MongoDB
- ✅ Separates images from other files
- ✅ Sends mood/sentiment analysis with entry
- ✅ Includes error handling and loading states

### 4. **Entries.js** (Frontend)
- ✅ Fetches entries from backend: `GET /api/entries/user/:userId`
- ✅ Displays images with thumbnails
- ✅ Supports video playback
- ✅ Shows mood badges and tags

## How It Works

### Uploading Entry with Images

1. User writes journal entry
2. User uploads images/files using file picker
3. Frontend converts images to base64
4. **Sends to backend**:
```json
{
  "userId": "user_id",
  "content": "Entry text",
  "images": [
    {
      "name": "photo.jpg",
      "type": "image/jpeg",
      "size": 102400,
      "dataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    }
  ],
  "files": [...],
  "tags": ["keyword1", "keyword2"],
  "mood": "happy"
}
```

5. **Backend stores in MongoDB** with all metadata
6. Frontend navigates to Entries page

### Viewing Entries with Images

1. Backend returns entry with base64 image data
2. Frontend displays image thumbnails in 2-column grid
3. Click image to view full size
4. Base64 data is embedded directly - no external file server needed

## Data Structure in MongoDB

### Entry Document Example
```javascript
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "title": "My Day",
  "content": "Had a great day today!",
  "mood": "happy",
  "sentiment": "happy",
  "tags": ["great", "wonderful"],
  "images": [
    {
      "name": "sunset.jpg",
      "type": "image/jpeg",
      "size": 256000,
      "dataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    }
  ],
  "files": [
    {
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 512000,
      "dataUrl": "data:application/pdf;base64,JVBERi..."
    }
  ],
  "createdAt": ISODate("2026-01-20T12:34:56.789Z"),
  "updatedAt": ISODate("2026-01-20T12:34:56.789Z")
}
```

## Checking in MongoDB Compass

1. Open **MongoDB Compass**
2. Go to: `mindsync` → `entries` collection
3. **You should see entries with embedded images!**

### Example Query to Find Entries with Images
```javascript
db.entries.find({ "images.0": { $exists: true } })
```

## Supported File Types

### Images
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.bmp`

### Videos
- `.mp4`, `.webm`, `.ogg`, `.mov`

### Documents
- `.pdf`, `.doc`, `.docx`, `.txt`

## Advantages

✅ **All data in MongoDB** - No separate file storage needed  
✅ **Base64 encoding** - Images embedded directly in database  
✅ **Automatic backup** - Images backed up with database  
✅ **No file paths** - Portable between systems  
✅ **Easy sharing** - Export entire entries with images  

## Size Considerations

⚠️ **Note**: MongoDB has a **16MB document size limit**  
- Average JPG: 2-5 MB
- Safe to store 3-5 images per entry
- For larger files, consider:
  - MongoDB GridFS
  - External storage (AWS S3, Firebase)
  - File compression

## Testing

1. **Create new entry** with title and text
2. **Upload image** using the file picker
3. **Click "Save Entry"**
4. **Check MongoDB Compass**:
   - Go to `entries` collection
   - Find your entry
   - Expand `images` array
   - See the base64 `dataUrl`

## API Endpoints Updated

```
POST   /api/entries              - Create entry with images
GET    /api/entries/user/:userId - Get all entries with images
GET    /api/entries/:entryId     - Get single entry with images
PUT    /api/entries/:entryId     - Update entry with images
DELETE /api/entries/:entryId     - Delete entry
```

All endpoints now support image/file storage! 🎉
