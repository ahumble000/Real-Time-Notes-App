const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all public notes
router.get('/public', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isPublic: true };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const notes = await Note.find(query)
      .populate('author', 'username')
      .populate('lastEditedBy', 'username')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    res.json({
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching public notes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's private notes
router.get('/private', auth, async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { 
      author: req.user._id,
      isPublic: false 
    };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const notes = await Note.find(query)
      .populate('author', 'username')
      .populate('lastEditedBy', 'username')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    res.json({
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching private notes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all notes for authenticated user (both public and private)
router.get('/my', auth, async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { author: req.user._id };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const notes = await Note.find(query)
      .populate('author', 'username')
      .populate('lastEditedBy', 'username')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    res.json({
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user notes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('author', 'username')
      .populate('lastEditedBy', 'username')
      .populate('collaborators', 'username');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check if user has access to the note
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;
    let hasAccess = note.isPublic;

    if (token && !hasAccess) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        hasAccess = note.author._id.toString() === decoded.userId ||
                   note.collaborators.some(collab => collab._id.toString() === decoded.userId);
      } catch (error) {
        // Token invalid, but note might be public
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new note
router.post('/', auth, async (req, res) => {
  try {
    const { title, content = '', isPublic = false } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const note = new Note({
      title,
      content,
      isPublic,
      author: req.user._id,
      lastEditedBy: req.user._id
    });

    await note.save();
    
    const populatedNote = await Note.findById(note._id)
      .populate('author', 'username')
      .populate('lastEditedBy', 'username');

    res.status(201).json(populatedNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, isPublic } = req.body;
    
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check if user is the author
    if (note.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update fields if provided
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (isPublic !== undefined) note.isPublic = isPublic;
    
    note.lastEditedBy = req.user._id;
    note.version += 1;

    await note.save();
    
    const updatedNote = await Note.findById(note._id)
      .populate('author', 'username')
      .populate('lastEditedBy', 'username');

    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check if user is the author
    if (note.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Note.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
