const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const User = require('../models/User');
const City = require('../models/City');

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
const createIssue = asyncHandler(async (req, res) => {
  try {
    const { title, description, category, priority, location, city } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: 'Title and description are required'
      });
    }

    // Find or create city
    let cityRef;
    try {
      // First try to find existing city
      cityRef = await City.findOne({
        name: { $regex: new RegExp('^' + city + '$', 'i') }
      });

      // If city doesn't exist, create it
      if (!cityRef) {
        cityRef = await City.create({
          name: city,
          state: 'Unknown', // Default state
          country: 'India',
          coordinates: location ? {
            type: 'Point',
            coordinates: location.coordinates
          } : {
            type: 'Point',
            coordinates: [77.0, 20.0] // Default coordinates for India
          }
        });
      }
    } catch (cityError) {
      console.error('Error handling city:', cityError);
      // If city handling fails, store the city name as string
      cityRef = city;
    }

    const issueData = {
      title,
      description,
      category: category || 'others',
      priority: priority || 'medium',
      reportedBy: req.user._id,
      status: 'reported',
      city: cityRef._id || cityRef,
      location: location ? {
        type: 'Point',
        coordinates: [
          parseFloat(location.coordinates[0]),
          parseFloat(location.coordinates[1])
        ],
        address: location.address || 'Location not specified'
      } : null,
      statusHistory: [{
        status: 'reported',
        changedBy: req.user._id,
        timestamp: Date.now()
      }]
    };

    const issue = await Issue.create(issueData);

    if (!issue) {
      return res.status(400).json({ message: 'Failed to create issue' });
    }

    // Return populated issue
    const populatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name role')
      .populate('city', 'name state')
      .populate('assignedTo', 'name role department');

    return res.status(201).json(populatedIssue);

  } catch (error) {
    console.error('Error creating issue:', error);
    return res.status(500).json({
      message: 'Server error creating issue',
      error: error.message
    });
  }
});

// @desc    Get all issues
// @route   GET /api/issues
// @access  Public
const getIssues = asyncHandler(async (req, res) => {
  const {
    category,
    status,
    city,
    lng,
    lat,
    radius,
    sort = '-createdAt'
  } = req.query;

  // Build query
  const query = {};

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by city
  if (city) {
    query.city = city;
  }

  // Filter by location (geo)
  if (lng && lat && radius) {
    query['location.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(radius)
      }
    };
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Execute query
  const issues = await Issue.find(query)
    .populate('reportedBy', 'name role profileImage')
    .populate('city', 'name state')
    .populate('assignedTo', 'name role department')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Issue.countDocuments(query);

  res.json({
    issues,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Get issue by ID
// @route   GET /api/issues/:id
// @access  Public
const getIssueById = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id)
    .populate('reportedBy', 'name role profileImage')
    .populate('city', 'name state')
    .populate('assignedTo', 'name role department')
    .populate({
      path: 'statusHistory.changedBy',
      select: 'name role department'
    });

  if (issue) {
    res.json(issue);
  } else {
    res.status(404);
    throw new Error('Issue not found');
  }
});

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
const updateIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  // Check if user is authorized to update this issue
  // Only admin, department, or the person who reported the issue
  if (
    req.user.role !== 'admin' &&
    req.user.role !== 'department' &&
    issue.reportedBy.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to update this issue');
  }

  // Update basic fields if provided
  const {
    title,
    description,
    category,
    priority,
    location
  } = req.body;

  if (title) issue.title = title;
  if (description) issue.description = description;
  if (category) issue.category = category;
  if (priority) issue.priority = priority;
  if (location) issue.location = location;

  // Update status if provided and has changed
  if (req.body.status && req.body.status !== issue.status) {
    // Only department or admin can change status
    if (req.user.role !== 'admin' && req.user.role !== 'department') {
      res.status(403);
      throw new Error('Only departments or admins can change issue status');
    }
    console.log(`Updating issue status from ${issue.status} to ${req.body.status}`);
    issue.status = req.body.status;
    
    // Add status note if provided or use default message
    const statusNote = req.body.statusNote || req.body.comment || `Status updated to ${req.body.status}`;
    
    // Add to status history if tracking history
    if (issue.statusHistory) {
      issue.statusHistory.push({
        status: req.body.status,
        updatedBy: req.user._id,
        updatedAt: new Date(),
        note: statusNote,
        timestamp: Date.now()
      });
    } else {
      issue.statusHistory = [{
        status: req.body.status,
        updatedBy: req.user._id,
        updatedAt: new Date(),
        note: statusNote,
        timestamp: Date.now()
      }];
    }

    // Update resolved/closed dates
    if (req.body.status === 'resolved' && !issue.resolvedAt) {
      issue.resolvedAt = Date.now();
    } else if (req.body.status === 'closed' && !issue.closedAt) {
      issue.closedAt = Date.now();
    }
  }

  // Handle assignment
  if (req.body.assignedTo) {
    // Only department or admin can assign issues
    if (req.user.role !== 'admin' && req.user.role !== 'department') {
      res.status(403);
      throw new Error('Only departments or admins can assign issues');
    }

    issue.assignedTo = req.body.assignedTo;
  }

  // Add new images if any
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => file.path);
    issue.images = [...issue.images, ...newImages];
  }

  // Save the updated issue
  const updatedIssue = await issue.save();

  res.json(updatedIssue);
});

// @desc    Add feedback to issue (before deletion)
// @route   PUT /api/issues/:id/feedback
// @access  Private
const addFeedback = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  // Only admin or the one who reported can add feedback
  if (
    req.user.role !== 'admin' &&
    issue.reportedBy.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to add feedback to this issue');
  }

  // Add the feedback to a feedback array or field
  if (req.body.feedback) {
    // Store feedback in a separate collection or log it as needed
    console.log(`Issue ${issue._id} feedback: ${req.body.feedback}`);
    // You can also store in a database if needed
  }

  res.json({ message: 'Feedback received', success: true });
});

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private/Admin
const deleteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  // Only admin or the one who reported can delete
  if (
    req.user.role !== 'admin' &&
    issue.reportedBy.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this issue');
  }

  // Use findByIdAndDelete instead of remove() for newer Mongoose versions
  await Issue.findByIdAndDelete(req.params.id);
  res.json({ message: 'Issue removed', success: true });
});

// @desc    Upvote an issue
// @route   POST /api/issues/:id/upvote
// @access  Private
const upvoteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  // Check if user already upvoted
  const alreadyUpvoted = issue.upvotes.includes(req.user._id);

  if (alreadyUpvoted) {
    // Remove upvote
    issue.upvotes = issue.upvotes.filter(
      id => id.toString() !== req.user._id.toString()
    );
  } else {
    // Add upvote
    issue.upvotes.push(req.user._id);

    // Remove from downvotes if present
    issue.downvotes = issue.downvotes.filter(
      id => id.toString() !== req.user._id.toString()
    );
  }

  await issue.save();
  res.status(200).json({
    upvotes: issue.upvotes.length,
    downvotes: issue.downvotes.length,
    upvoted: !alreadyUpvoted,
    downvoted: false
  });
});

// @desc    Downvote an issue
// @route   POST /api/issues/:id/downvote
// @access  Private
const downvoteIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue) {
    res.status(404);
    throw new Error('Issue not found');
  }

  // Check if user already downvoted
  const alreadyDownvoted = issue.downvotes.includes(req.user._id);

  if (alreadyDownvoted) {
    // Remove downvote
    issue.downvotes = issue.downvotes.filter(
      id => id.toString() !== req.user._id.toString()
    );
  } else {
    // Add downvote
    issue.downvotes.push(req.user._id);

    // Remove from upvotes if present
    issue.upvotes = issue.upvotes.filter(
      id => id.toString() !== req.user._id.toString()
    );
  }

  await issue.save();
  res.status(200).json({
    upvotes: issue.upvotes.length,
    downvotes: issue.downvotes.length,
    upvoted: false,
    downvoted: !alreadyDownvoted
  });
});

// @desc    Get issues reported by user
// @route   GET /api/issues/user
// @access  Private
const getUserIssues = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const issues = await Issue.find({ reportedBy: req.user._id })
    .populate('city', 'name state')
    .populate('assignedTo', 'name role department')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Issue.countDocuments({ reportedBy: req.user._id });

  res.json({
    issues,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Get issues assigned to department
// @route   GET /api/issues/department
// @access  Private/Department
const getDepartmentIssues = asyncHandler(async (req, res) => {
  // Only department users can access this
  if (req.user.role !== 'department' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  // If admin, they can see all issues
  // If department, they only see issues in their city and relevant to their department
  if (req.user.role === 'department') {
    query = {
      city: req.user.city,
      // In future, we could add department-specific filtering here
    };
  }

  const status = req.query.status;
  if (status) {
    query.status = status;
  }

  const issues = await Issue.find(query)
    .populate('reportedBy', 'name role profileImage')
    .populate('city', 'name state')
    .populate('assignedTo', 'name role department')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Issue.countDocuments(query);

  res.json({
    issues,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Get SLA statistics for department
// @route   GET /api/issues/sla/statistics
// @access  Private/Department
const getSLAStatistics = asyncHandler(async (req, res) => {
  const slaManager = require('../utils/slaManager');
  
  try {
    const departmentId = req.user.role === 'department' ? req.user._id : null;
    const stats = await slaManager.getSLAStatistics(departmentId);
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting SLA statistics:', error);
    res.status(500).json({ message: 'Error fetching SLA statistics' });
  }
});

// @desc    Get overdue issues
// @route   GET /api/issues/sla/overdue
// @access  Private/Department
const getOverdueIssues = asyncHandler(async (req, res) => {
  const slaManager = require('../utils/slaManager');
  
  try {
    const departmentId = req.user.role === 'department' ? req.user._id : null;
    const overdueIssues = await slaManager.getOverdueIssues(departmentId);
    
    res.json(overdueIssues);
  } catch (error) {
    console.error('Error getting overdue issues:', error);
    res.status(500).json({ message: 'Error fetching overdue issues' });
  }
});

// @desc    Check and escalate issues
// @route   POST /api/issues/sla/escalate
// @access  Private/Department
const checkAndEscalateIssues = asyncHandler(async (req, res) => {
  const slaManager = require('../utils/slaManager');
  
  try {
    const departmentId = req.user.role === 'department' ? req.user._id : null;
    const results = await slaManager.checkAndEscalateIssues(departmentId);
    
    res.json(results);
  } catch (error) {
    console.error('Error checking and escalating issues:', error);
    res.status(500).json({ message: 'Error checking escalations' });
  }
});

// @desc    Update SLA deadline for an issue
// @route   PUT /api/issues/:id/sla
// @access  Private/Department
const updateSLADeadline = asyncHandler(async (req, res) => {
  const slaManager = require('../utils/slaManager');
  
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      res.status(404);
      throw new Error('Issue not found');
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'department') {
      res.status(403);
      throw new Error('Not authorized to update SLA');
    }
    
    const { priority } = req.body;
    
    if (priority && priority !== issue.priority) {
      const newDeadline = slaManager.updateSLADeadline(issue, priority);
      issue.slaDeadline = newDeadline;
      issue.priority = priority;
      
      await issue.save();
    }
    
    res.json(issue);
  } catch (error) {
    console.error('Error updating SLA deadline:', error);
    res.status(500).json({ message: 'Error updating SLA deadline' });
  }
});

// @desc    Get SLA progress for an issue
// @route   GET /api/issues/:id/sla
// @access  Private
const getSLAPgress = asyncHandler(async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      res.status(404);
      throw new Error('Issue not found');
    }
    
    const slaManager = require('../utils/slaManager');
    
    const progress = slaManager.calculateSLAProgress(issue.createdAt, issue.slaDeadline);
    const escalationLevel = slaManager.getEscalationLevel(progress);
    const timeRemaining = slaManager.getTimeRemaining(issue.slaDeadline);
    
    res.json({
      progress,
      escalationLevel,
      timeRemaining,
      timeRemainingFormatted: slaManager.formatTimeRemaining(timeRemaining),
      slaBreached: issue.slaBreached,
      escalationHistory: issue.escalationHistory
    });
  } catch (error) {
    console.error('Error getting SLA progress:', error);
    res.status(500).json({ message: 'Error fetching SLA progress' });
  }
});

module.exports = {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  upvoteIssue,
  downvoteIssue,
  getUserIssues,
  getDepartmentIssues,
  addFeedback,
  getSLAStatistics,
  getOverdueIssues,
  checkAndEscalateIssues,
  updateSLADeadline,
  getSLAPgress
};
