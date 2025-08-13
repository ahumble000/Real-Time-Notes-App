const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['personal', 'work', 'study', 'project', 'meeting', 'idea', 'todo', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'review', 'completed'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminders: [{
    message: String,
    date: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  versions: [{
    content: String,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    changeDescription: String
  }],
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    edits: {
      type: Number,
      default: 0
    },
    collaborations: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0 // in minutes
    }
  },
  sharing: {
    isPasswordProtected: {
      type: Boolean,
      default: false
    },
    password: String,
    expiresAt: Date,
    allowDownload: {
      type: Boolean,
      default: true
    },
    allowPrint: {
      type: Boolean,
      default: true
    }
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Enhanced indexes for better performance
noteSchema.index({ author: 1, createdAt: -1 });
noteSchema.index({ workspace: 1, updatedAt: -1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ title: 'text', content: 'text' });
noteSchema.index({ category: 1, priority: 1 });
noteSchema.index({ isPublic: 1, createdAt: -1 });
noteSchema.index({ isPinned: 1, isFavorite: 1 });

noteSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.version += 1;
    this.analytics.edits += 1;
  }
  next();
});

module.exports = mongoose.model('Note', noteSchema);
