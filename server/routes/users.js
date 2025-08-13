const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      profile, 
      preferences 
    } = req.body;

    const user = await User.findById(req.user._id);

    if (profile) {
      // Handle profile updates more carefully
      const currentProfile = user.profile?.toObject?.() || {};
      const updatedProfile = { ...currentProfile };
      
      // Only update fields that are provided and not undefined
      Object.keys(profile).forEach(key => {
        if (profile[key] !== undefined) {
          if (key === 'socialLinks' && typeof profile[key] === 'object') {
            // Handle socialLinks specifically
            updatedProfile.socialLinks = {
              ...(updatedProfile.socialLinks || {}),
              ...profile[key]
            };
          } else {
            updatedProfile[key] = profile[key];
          }
        }
      });
      
      user.profile = updatedProfile;
    }

    if (preferences) {
      // Handle preferences updates
      const currentPreferences = user.preferences?.toObject?.() || {};
      const updatedPreferences = { ...currentPreferences };
      Object.keys(preferences).forEach(key => {
        if (preferences[key] !== undefined) {
          updatedPreferences[key] = preferences[key];
        }
      });
      user.preferences = updatedPreferences;
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('usage subscription');
    res.json({
      usage: user.usage,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users (for collaboration)
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { 'profile.firstName': { $regex: q, $options: 'i' } },
            { 'profile.lastName': { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username email profile.firstName profile.lastName profile.avatar')
    .limit(parseInt(limit));

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.preferences = { ...user.preferences, ...req.body };
    await user.save();

    res.json({ 
      message: 'Preferences updated successfully',
      preferences: user.preferences 
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user._id);

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // TODO: Add cleanup logic for user's notes, workspaces, etc.
    // For now, we'll just delete the user account

    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
