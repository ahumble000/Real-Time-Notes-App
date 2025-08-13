const express = require('express');
const mongoose = require('mongoose');
const Analytics = require('../models/Analytics');
const Note = require('../models/Note');
const Workspace = require('../models/Workspace');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user analytics dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get analytics data
    const analytics = await Analytics.find({
      user: userId,
      timestamp: { $gte: startDate }
    }).populate('note', 'title').populate('workspace', 'name');

    // Get notes stats
    const notesStats = await Note.aggregate([
      { $match: { author: userId } },
      {
        $group: {
          _id: null,
          totalNotes: { $sum: 1 },
          totalViews: { $sum: '$analytics.views' },
          totalEdits: { $sum: '$analytics.edits' },
          totalTimeSpent: { $sum: '$analytics.timeSpent' },
          pinnedNotes: { $sum: { $cond: ['$isPinned', 1, 0] } },
          favoriteNotes: { $sum: { $cond: ['$isFavorite', 1, 0] } },
          averageLength: { $avg: { $strLenCP: '$content' } }
        }
      }
    ]);

    // Get workspace stats
    const workspaceStats = await Workspace.aggregate([
      {
        $match: {
          $or: [
            { owner: userId },
            { 'members.user': userId }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalWorkspaces: { $sum: 1 },
          collaborations: {
            $sum: {
              $cond: [
                { $gt: [{ $size: '$members' }, 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Activity by day
    const dailyActivity = await Analytics.aggregate([
      {
        $match: {
          user: userId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 },
          actions: { $push: '$action' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Most used categories
    const categoryStats = await Note.aggregate([
      { $match: { author: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Most productive hours
    const hourlyActivity = await Analytics.aggregate([
      {
        $match: {
          user: userId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { hour: { $hour: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.hour': 1 } }
    ]);

    const notes = notesStats[0] || {
      totalNotes: 0,
      totalViews: 0,
      totalEdits: 0,
      totalTimeSpent: 0,
      pinnedNotes: 0,
      favoriteNotes: 0,
      averageLength: 0
    };

    const workspaces = workspaceStats[0] || {
      totalWorkspaces: 0,
      collaborations: 0
    };

    // Calculate streak days
    const today = new Date().toISOString().split('T')[0];
    let streakDays = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const dateString = currentDate.toISOString().split('T')[0];
      const hasActivity = dailyActivity.some(day => day._id.date === dateString);
      
      if (hasActivity) {
        streakDays++;
      } else if (i > 0) {
        break; // Streak broken
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }

    res.json({
      period,
      overview: {
        totalNotes: notes.totalNotes,
        totalViews: notes.totalViews,
        totalEdits: notes.totalEdits,
        timeSpent: notes.totalTimeSpent,
        pinnedNotes: notes.pinnedNotes,
        favoriteNotes: notes.favoriteNotes,
        totalActions: analytics.length,
        totalWorkspaces: workspaces.totalWorkspaces,
        collaborations: workspaces.collaborations,
        averageNoteLength: Math.round(notes.averageLength || 0),
        streakDays,
        totalTemplatesUsed: 0 // TODO: Add template tracking
      },
      dailyActivity,
      categoryStats,
      hourlyActivity,
      recentActions: analytics.slice(-20).reverse()
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Log user action
router.post('/track', auth, async (req, res) => {
  try {
    const { action, noteId, workspaceId, details } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    const analytics = new Analytics({
      user: req.user._id,
      note: noteId,
      workspace: workspaceId,
      action,
      details: details || {}
    });

    await analytics.save();

    // Update note analytics if note action
    if (noteId && ['view', 'edit'].includes(action)) {
      const updateField = action === 'view' ? 'analytics.views' : 'analytics.edits';
      await Note.findByIdAndUpdate(noteId, {
        $inc: { [updateField]: 1 }
      });
    }

    res.json({ message: 'Action tracked successfully' });
  } catch (error) {
    console.error('Error tracking action:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get note analytics
router.get('/notes/:noteId', auth, async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check access
    const hasAccess = note.author.toString() === req.user._id.toString() ||
                     note.collaborators.includes(req.user._id) ||
                     note.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get analytics for this note
    const analytics = await Analytics.find({ note: noteId })
      .populate('user', 'username email')
      .sort({ timestamp: -1 })
      .limit(100);

    // Activity by day
    const dailyActivity = await Analytics.aggregate([
      { $match: { note: mongoose.Types.ObjectId(noteId) } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      note: {
        id: note._id,
        title: note.title,
        analytics: note.analytics
      },
      recentActivity: analytics,
      dailyActivity
    });
  } catch (error) {
    console.error('Error fetching note analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get collaboration insights
router.get('/collaboration', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get collaboration stats
    const collaborationStats = await Note.aggregate([
      {
        $match: {
          $or: [
            { author: userId },
            { collaborators: userId }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalCollaborativeNotes: {
            $sum: {
              $cond: [{ $gt: [{ $size: '$collaborators' }, 0] }, 1, 0]
            }
          },
          totalCollaborators: {
            $sum: { $size: '$collaborators' }
          }
        }
      }
    ]);

    // Most frequent collaborators
    const topCollaborators = await Note.aggregate([
      {
        $match: {
          author: userId,
          collaborators: { $ne: [] }
        }
      },
      { $unwind: '$collaborators' },
      {
        $group: {
          _id: '$collaborators',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Populate collaborator details
    await Note.populate(topCollaborators, {
      path: '_id',
      select: 'username email profile.avatar'
    });

    res.json({
      stats: collaborationStats[0] || { totalCollaborativeNotes: 0, totalCollaborators: 0 },
      topCollaborators: topCollaborators.map(item => ({
        user: item._id,
        collaborationCount: item.count
      }))
    });
  } catch (error) {
    console.error('Error fetching collaboration insights:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
