# Daily Entry Streak Feature

## Overview
Added a daily entry streak tracking system to incentivize users to maintain consistent journaling habits.

## Backend Changes

### 1. User Model (`server/models/User.js`)
Added streak tracking fields to the user schema:
```javascript
streak: {
  current: Number (default: 0),      // Current consecutive days with entries
  longest: Number (default: 0),      // Longest streak achieved
  lastEntryDate: Date (default: null) // Date of the most recent entry
}
```

### 2. Entries Routes (`server/routes/entries.js`)
Added streak calculation logic:

#### New Helper Function: `updateUserStreak(userId)`
- Calculates current streak by checking consecutive daily entries
- Determines if entry was made today or yesterday (required to maintain streak)
- Calculates longest streak throughout history
- Groups entries by date (only one entry per day counts)
- Automatically handles streak resets if no entry for 2+ days

#### Modified Routes:
1. **POST /api/entries** - Now automatically updates user streak after creating an entry
2. **GET /api/entries/user/:userId** - Returns both entries and calculated streak data
3. **DELETE /api/entries/:entryId** - Recalculates streak after entry deletion
4. **GET /api/entries/streak/:userId** - New endpoint to fetch only streak data

## Frontend Changes

### Entries Component (`src/pages/Entries.js`)
1. Added `streak` state to track current and longest streaks
2. Updated entry fetch handler to extract streak data from response
3. Backwards compatible with old API format (returns array only)
4. Added two new stat cards in the stats display:
   - **Current Streak**: Shows consecutive days with entries (🔥 icon)
   - **Longest Streak**: Shows best streak achieved (⭐ icon)

## How It Works

1. **Creating an Entry**: When a user creates a new journal entry, the backend automatically:
   - Saves the entry
   - Fetches all entries for that user
   - Groups entries by date (one entry per day)
   - Calculates current streak based on consecutive days
   - Stores streak data in user document

2. **Current Streak Logic**:
   - Resets to 0 if no entry made yesterday or today
   - Increments if entry made today (continuing from yesterday)
   - Counts consecutive days only (gaps break the streak)

3. **Longest Streak**: 
   - Tracks the maximum consecutive days ever achieved
   - Never decreases (preserved for motivation)

4. **Display**: 
   - Current and longest streaks shown on the Entries dashboard
   - Real-time updates when new entries are created
   - Recalculated on page load

## Usage

Users can now:
- See their current daily entry streak
- Track their personal best (longest streak)
- Get motivated to maintain their journaling habits
- Observe progress on the entries dashboard

## API Response Format

**GET /api/entries/user/:userId** now returns:
```javascript
{
  entries: [...],
  streak: {
    current: 5,
    longest: 12,
    lastEntryDate: "2026-01-22T00:00:00Z"
  }
}
```

## Notes
- Streak calculation is smart enough to understand date transitions
- Only one entry per day counts (multiple entries in a day don't increase streak)
- Streaks survive timezone issues by using date-only comparison
- Backwards compatible with frontend code that expects array response
