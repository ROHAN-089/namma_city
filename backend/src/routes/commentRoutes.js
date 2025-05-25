const express = require('express');
const router = express.Router();
const {
  createComment,
  getCommentsByIssue,
  updateComment,
  deleteComment,
  likeComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { uploadIssueImage } = require('../config/cloudinary');

// Create comment
router.post('/', protect, uploadIssueImage.array('images', 3), createComment);

// Get comments by issue
router.get('/issue/:issueId', getCommentsByIssue);

// Update, delete, like comment
router.route('/:id')
  .put(protect, uploadIssueImage.array('images', 3), updateComment)
  .delete(protect, deleteComment);

router.post('/:id/like', protect, likeComment);

module.exports = router;
