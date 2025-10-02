const express = require('express');
const Analysis = require('../models/Analysis');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all analyses for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const analyses = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');

    const total = await Analysis.countDocuments({ userId: req.user._id });

    res.json({
      analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({
      error: 'Failed to retrieve analyses',
      message: 'Unable to fetch your analysis history'
    });
  }
});

// Get specific analysis by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('userId', 'name email');

    if (!analysis) {
      return res.status(404).json({
        error: 'Analysis not found',
        message: 'The requested analysis could not be found'
      });
    }

    res.json({ analysis });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      error: 'Failed to retrieve analysis',
      message: 'Unable to fetch the requested analysis'
    });
  }
});

// Save new analysis
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      summary,
      keywords,
      markdownContent,
      inputContent,
      inputType,
      originalUrl,
      fileName
    } = req.body;

    // Validation
    if (!title || !summary || !markdownContent || !inputContent || !inputType) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, summary, content, input content, and input type are required'
      });
    }

    const analysis = new Analysis({
      userId: req.user._id,
      title: title.trim(),
      summary: summary.trim(),
      keywords: keywords || [],
      markdownContent,
      inputContent,
      inputType,
      originalUrl,
      fileName
    });

    await analysis.save();

    // Populate user info
    await analysis.populate('userId', 'name email');

    res.status(201).json({
      message: 'Analysis saved successfully',
      analysis
    });
  } catch (error) {
    console.error('Save analysis error:', error);
    res.status(500).json({
      error: 'Failed to save analysis',
      message: 'Unable to save your analysis. Please try again.'
    });
  }
});

// Update analysis
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      summary,
      keywords,
      markdownContent
    } = req.body;

    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({
        error: 'Analysis not found',
        message: 'The requested analysis could not be found'
      });
    }

    // Update fields if provided
    if (title) analysis.title = title.trim();
    if (summary) analysis.summary = summary.trim();
    if (keywords) analysis.keywords = keywords;
    if (markdownContent) analysis.markdownContent = markdownContent;

    await analysis.save();
    await analysis.populate('userId', 'name email');

    res.json({
      message: 'Analysis updated successfully',
      analysis
    });
  } catch (error) {
    console.error('Update analysis error:', error);
    res.status(500).json({
      error: 'Failed to update analysis',
      message: 'Unable to update your analysis. Please try again.'
    });
  }
});

// Delete analysis
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({
        error: 'Analysis not found',
        message: 'The requested analysis could not be found'
      });
    }

    res.json({
      message: 'Analysis deleted successfully'
    });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({
      error: 'Failed to delete analysis',
      message: 'Unable to delete your analysis. Please try again.'
    });
  }
});

module.exports = router;
