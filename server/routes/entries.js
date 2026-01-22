const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const User = require('../models/User');

// Helper function to calculate and update streak
const updateUserStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // Get all entries sorted by date
    const entries = await Entry.find({ userId }).sort({ createdAt: -1 });
    
    if (entries.length === 0) {
      return user;
    }

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastEntryDate = null;

    // Group entries by date
    const entryDates = entries.map(e => {
      const date = new Date(e.createdAt);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    // Remove duplicates - count only one entry per day
    const uniqueDates = [];
    for (let date of entryDates) {
      if (!uniqueDates.some(d => d.getTime() === date.getTime())) {
        uniqueDates.push(date);
      }
    }

    lastEntryDate = uniqueDates[0];

    // Check if there's an entry today or yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (uniqueDates[0].getTime() === today.getTime() || 
        uniqueDates[0].getTime() === yesterday.getTime()) {
      currentStreak = 1;

      // Calculate current streak by looking at consecutive days
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffTime = prevDate.getTime() - currDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    tempStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffTime = prevDate.getTime() - currDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Update user streak
    user.streak = {
      current: currentStreak,
      longest: longestStreak,
      lastEntryDate: lastEntryDate
    };

    await user.save();
    return user;
  } catch (err) {
    console.error('Error updating streak:', err);
    return null;
  }
};

// Create entry
router.post('/', async (req, res) => {
  try {
    const { userId, title, content, mood, tags, images, files, sentiment } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content are required' });
    }

    const entry = new Entry({ 
      userId, 
      title, 
      content, 
      mood, 
      tags, 
      images: images || [],
      files: files || [],
      sentiment
    });
    await entry.save();
    
    // Update user streak
    await updateUserStreak(userId);
    
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all entries for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    
    // Update streak on fetch
    const user = await updateUserStreak(req.params.userId);
    
    res.json({ entries, streak: user?.streak || { current: 0, longest: 0, lastEntryDate: null } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single entry
router.get('/:entryId', async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.entryId);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update entry
router.put('/:entryId', async (req, res) => {
  try {
    const { title, content, mood, tags, images, files, sentiment } = req.body;
    const entry = await Entry.findByIdAndUpdate(
      req.params.entryId,
      { 
        title, 
        content, 
        mood, 
        tags, 
        images: images || [],
        files: files || [],
        sentiment,
        updatedAt: Date.now() 
      },
      { new: true }
    );
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete entry
router.delete('/:entryId', async (req, res) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.entryId);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    // Update streak after deleting an entry
    if (entry.userId) {
      await updateUserStreak(entry.userId);
    }
    
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user streak
router.get('/streak/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.streak);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
