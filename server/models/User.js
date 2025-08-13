const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: {
      type: String,
      maxlength: 500
    },
    location: String,
    website: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: String,
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    collaborationUpdates: {
      type: Boolean,
      default: true
    },
    weeklyDigest: {
      type: Boolean,
      default: true
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'team', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  usage: {
    notesCreated: {
      type: Number,
      default: 0
    },
    workspacesCreated: {
      type: Number,
      default: 0
    },
    collaborations: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number,
      default: 0 // in bytes
    }
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'subscription.plan': 1 });

// Update last active on save
userSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.lastActive = Date.now();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
