const mongoose = require('mongoose');

// RAG Index Schema to store embeddings of journal entries
const ragIndexSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  entryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  metadata: {
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    mood: {
      type: String,
      default: 'neutral',
      index: true
    },
    tags: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create compound index for faster queries
ragIndexSchema.index({ userId: 1, createdAt: -1 });
ragIndexSchema.index({ userId: 1, 'metadata.mood': 1 });

module.exports = mongoose.model('RAGIndex', ragIndexSchema);
