const express = require('express');
const Template = require('../models/Template');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all public templates + user's templates
router.get('/', auth, async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    let query = {
      $or: [
        { isPublic: true },
        { creator: req.user._id }
      ]
    };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const templates = await Template.find(query)
      .populate('creator', 'username email')
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Template.countDocuments(query);

    res.json({
      templates,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create template
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, content, category, tags, isPublic } = req.body;

    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content are required' });
    }

    const template = new Template({
      name,
      description,
      content,
      category: category || 'other',
      tags: tags || [],
      creator: req.user._id,
      isPublic: isPublic || false
    });

    await template.save();
    await template.populate('creator', 'username email');

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get template by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('creator', 'username email profile.avatar');

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check access
    const hasAccess = template.isPublic || 
                     template.creator._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Increment usage count
    template.usageCount += 1;
    await template.save();

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update template
router.put('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Only creator can update
    if (template.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const { name, description, content, category, tags, isPublic } = req.body;

    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (content) template.content = content;
    if (category) template.category = category;
    if (tags) template.tags = tags;
    if (isPublic !== undefined) template.isPublic = isPublic;

    await template.save();
    await template.populate('creator', 'username email');

    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete template
router.delete('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Only creator can delete
    if (template.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await Template.findByIdAndDelete(req.params.id);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Rate template
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Calculate new average rating
    const currentTotal = template.rating.average * template.rating.count;
    const newCount = template.rating.count + 1;
    const newAverage = (currentTotal + rating) / newCount;

    template.rating.average = parseFloat(newAverage.toFixed(1));
    template.rating.count = newCount;

    await template.save();

    res.json({
      message: 'Rating added successfully',
      rating: template.rating
    });
  } catch (error) {
    console.error('Error rating template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get template categories
router.get('/categories/list', (req, res) => {
  const categories = [
    'meeting',
    'project', 
    'personal',
    'study',
    'work',
    'creative',
    'other'
  ];
  res.json(categories);
});

module.exports = router;
