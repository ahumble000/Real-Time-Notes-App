const express = require('express');
const Workspace = require('../models/Workspace');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all workspaces for user
router.get('/', auth, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'username email')
    .populate('members.user', 'username email')
    .sort({ updatedAt: -1 });

    res.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create workspace
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPublic, allowGuestAccess } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    const workspace = new Workspace({
      name,
      description,
      owner: req.user._id,
      settings: {
        isPublic: isPublic || false,
        allowGuestAccess: allowGuestAccess || false
      }
    });

    await workspace.save();

    // Update user usage
    req.user.usage.workspacesCreated += 1;
    await req.user.save();

    await workspace.populate('owner', 'username email');
    res.status(201).json(workspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get workspace by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('members.user', 'username email profile.avatar');

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if user has access
    const hasAccess = workspace.owner._id.toString() === req.user._id.toString() ||
                     workspace.members.some(member => member.user._id.toString() === req.user._id.toString()) ||
                     workspace.settings.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get notes in this workspace
    const notes = await Note.find({ workspace: workspace._id })
      .populate('author', 'username email')
      .populate('lastEditedBy', 'username email')
      .sort({ updatedAt: -1 });

    res.json({
      workspace,
      notes
    });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update workspace
router.put('/:id', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if user is owner or admin
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isAdmin = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const { name, description, settings, tags } = req.body;

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (settings) workspace.settings = { ...workspace.settings, ...settings };
    if (tags) workspace.tags = tags;

    await workspace.save();
    await workspace.populate('owner', 'username email');
    await workspace.populate('members.user', 'username email');

    res.json(workspace);
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add member to workspace
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId, role = 'viewer' } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if user is owner or admin
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isAdmin = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Check if user is already a member
    const existingMember = workspace.members.find(member => 
      member.user.toString() === userId
    );

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    workspace.members.push({
      user: userId,
      role: role
    });

    await workspace.save();
    await workspace.populate('members.user', 'username email profile.avatar');

    res.json(workspace);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove member from workspace
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if user is owner or admin
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isAdmin = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    workspace.members = workspace.members.filter(member => 
      member.user.toString() !== req.params.userId
    );

    await workspace.save();
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete workspace
router.delete('/:id', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Only owner can delete workspace
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only workspace owner can delete it' });
    }

    // Move all notes in this workspace to user's personal space
    await Note.updateMany(
      { workspace: workspace._id },
      { $unset: { workspace: 1 } }
    );

    await Workspace.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
