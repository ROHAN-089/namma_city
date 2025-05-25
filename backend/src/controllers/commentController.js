const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Issue = require('../models/Issue');

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const { text, issue, parentComment } = req.body;

  // Check if issue exists
  const issueExists = await Issue.findById(issue);
  if (!issueExists) {
    res.status(404);
    throw new Error('Issue not found');
  }

  // Check if parent comment exists if provided
  if (parentComment) {
    const parentCommentExists = await Comment.findById(parentComment);
    if (!parentCommentExists) {
      res.status(404);
      throw new Error('Parent comment not found');
    }
  }

  const comment = await Comment.create({
    text,
    issue,
    user: req.user._id,
    parentComment: parentComment || null,
    images: req.files ? req.files.map(file => file.path) : []
  });

  // Populate user data before sending response
  await comment.populate('user', 'name role profileImage');

  res.status(201).json(comment);
});

// @desc    Get all comments for an issue
// @route   GET /api/comments/issue/:issueId
// @access  Public
const getCommentsByIssue = asyncHandler(async (req, res) => {
  const { issueId } = req.params;

  // Check if issue exists
  const issueExists = await Issue.findById(issueId);
  if (!issueExists) {
    res.status(404);
    throw new Error('Issue not found');
  }

  // Get top-level comments (no parent)
  const comments = await Comment.find({ 
    issue: issueId, 
    parentComment: null 
  })
    .populate('user', 'name role profileImage')
    .populate({
      path: 'replies',
      populate: {
        path: 'user',
        select: 'name role profileImage'
      }
    })
    .sort('-createdAt');

  res.json(comments);
});

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Check if user is the author of the comment
  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this comment');
  }

  comment.text = req.body.text || comment.text;

  // Add new images if any
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => file.path);
    comment.images = [...comment.images, ...newImages];
  }

  const updatedComment = await comment.save();
  await updatedComment.populate('user', 'name role profileImage');

  res.json(updatedComment);
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Check if user is the author of the comment or admin
  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this comment');
  }

  await comment.remove();

  // Also remove any replies to this comment
  await Comment.deleteMany({ parentComment: req.params.id });

  res.json({ message: 'Comment removed' });
});

// @desc    Like a comment
// @route   POST /api/comments/:id/like
// @access  Private
const likeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Check if user already liked
  const alreadyLiked = comment.likes.includes(req.user._id);

  if (alreadyLiked) {
    // Remove like
    comment.likes = comment.likes.filter(
      id => id.toString() !== req.user._id.toString()
    );
  } else {
    // Add like
    comment.likes.push(req.user._id);
  }

  await comment.save();
  res.status(200).json({ 
    likes: comment.likes.length,
    liked: !alreadyLiked
  });
});

module.exports = {
  createComment,
  getCommentsByIssue,
  updateComment,
  deleteComment,
  likeComment
};
