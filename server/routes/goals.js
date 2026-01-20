const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

// Create goal
router.post('/', async (req, res) => {
  try {
    const { userId, title, description, category, progress, status, targetDate } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: 'userId and title are required' });
    }

    const goal = new Goal({ userId, title, description, category, progress, status, targetDate });
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all goals for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single goal
router.get('/:goalId', async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update goal
router.put('/:goalId', async (req, res) => {
  try {
    const { title, description, category, progress, status, targetDate } = req.body;
    const goal = await Goal.findByIdAndUpdate(
      req.params.goalId,
      { title, description, category, progress, status, targetDate, updatedAt: Date.now() },
      { new: true }
    );
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete goal
router.delete('/:goalId', async (req, res) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.goalId);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
