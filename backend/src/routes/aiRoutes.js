/**
 * AI Enhancement Routes - Optional AI features for issues
 * These routes provide AI suggestions without modifying core functionality
 */
const express = require('express');
const asyncHandler = require('express-async-handler');
const aiEnhancementService = require('../services/aiEnhancementService');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @desc    Process complete issue with Gemini AI
 * @route   POST /api/ai/process-issue
 * @access  Private
 */
router.post('/process-issue', protect, asyncHandler(async (req, res) => {
  const { title, description, location, city, images } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Title is required for issue processing');
  }

  const issueData = {
    title: title.trim(),
    description: description?.trim() || '',
    location: location || {},
    city: city || '',
    images: images || []
  };

  const startTime = Date.now();
  const processedIssue = await aiEnhancementService.processCompleteIssue(issueData);
  const totalTime = Date.now() - startTime;

  res.json({
    success: true,
    processedIssue,
    processing: {
      aiUsed: processedIssue.aiProcessed,
      totalTime: `${totalTime}ms`,
      enhancementType: processedIssue.aiMetadata.enhancementType
    },
    timestamp: new Date()
  });
}));

/**
 * @desc    Get AI enhancement suggestions for an issue
 * @route   POST /api/ai/enhance
 * @access  Private
 */
router.post('/enhance', protect, asyncHandler(async (req, res) => {
  const { title, description, category, priority, location } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Title is required for AI enhancement');
  }

  const issueData = {
    title,
    description: description || '',
    category: category || 'others',
    priority: priority || 'medium',
    location: location || {}
  };

  const processedIssue = await aiEnhancementService.processCompleteIssue(issueData);

  res.json({
    success: true,
    enhanced: processedIssue.aiProcessed,
    original: {
      title: issueData.title,
      description: issueData.description,
      category: issueData.category,
      priority: issueData.priority
    },
    processed: processedIssue,
    timestamp: new Date()
  });
}));

/**
 * @desc    Get quick AI suggestions for partial input
 * @route   POST /api/ai/quick-suggestions
 * @access  Private
 */
router.post('/quick-suggestions', protect, asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || title.length < 2) {
    res.status(400);
    throw new Error('Title with at least 2 characters is required');
  }

  const suggestions = await aiEnhancementService.getQuickSuggestions(title, description);

  res.json({
    success: true,
    suggestions,
    timestamp: new Date()
  });
}));

/**
 * @desc    Check AI service status
 * @route   GET /api/ai/status
 * @access  Private
 */
router.get('/status', protect, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    aiAvailable: aiEnhancementService.isAvailable(),
    service: 'AI Enhancement Service',
    version: '1.0.0',
    timestamp: new Date()
  });
}));

/**
 * @desc    Test AI service with sample data
 * @route   POST /api/ai/test
 * @access  Private (only for testing)
 */
router.post('/test', protect, asyncHandler(async (req, res) => {
  const testIssue = {
    title: 'Pothole on MG Road',
    description: 'Large pothole causing traffic issues',
    category: 'others',
    priority: 'medium',
    location: { address: 'MG Road, Bangalore' }
  };

  const result = await aiEnhancementService.enhanceIssue(testIssue);

  res.json({
    success: true,
    testResult: result,
    message: 'AI service test completed',
    timestamp: new Date()
  });
}));

module.exports = router;