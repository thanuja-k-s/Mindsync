const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: String,
  type: String,
  size: Number,
  dataUrl: String
}, { _id: false });

const fileSchema = new mongoose.Schema({
  name: String,
  type: String,
  size: Number,
  dataUrl: String
}, { _id: false });

const entrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'anxious', 'calm', 'excited', 'neutral'],
    default: 'neutral'
  },
  tags: [String],
  images: [imageSchema],
  files: [fileSchema],
  sentiment: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Entry', entrySchema);
