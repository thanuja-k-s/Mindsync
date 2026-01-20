const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

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
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all entries for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(entries);
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
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
