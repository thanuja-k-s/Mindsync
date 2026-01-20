const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// Create reminder
router.post('/', async (req, res) => {
  try {
    const { userId, title, description, dueDate, priority, completed } = req.body;

    if (!userId || !title || !dueDate) {
      return res.status(400).json({ error: 'userId, title, and dueDate are required' });
    }

    const reminder = new Reminder({ userId, title, description, dueDate, priority, completed });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all reminders for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.params.userId }).sort({ dueDate: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single reminder
router.get('/:reminderId', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.reminderId);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update reminder
router.put('/:reminderId', async (req, res) => {
  try {
    const { title, description, dueDate, priority, completed } = req.body;
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.reminderId,
      { title, description, dueDate, priority, completed, updatedAt: Date.now() },
      { new: true }
    );
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete reminder
router.delete('/:reminderId', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.reminderId);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json({ message: 'Reminder deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
