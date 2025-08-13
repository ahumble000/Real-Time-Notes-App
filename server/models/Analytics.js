const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  note: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  },
  action: {
    type: String,
    enum: ['create', 'edit', 'delete', 'view', 'share', 'export', 'collaborate'],
    required: true
  },
  details: {
    duration: Number, // in seconds
    wordCount: Number,
    charactersTyped: Number,
    device: String,
    browser: String,
    location: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
analyticsSchema.index({ user: 1, timestamp: -1 });
analyticsSchema.index({ note: 1, action: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
