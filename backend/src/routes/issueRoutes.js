const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  upvoteIssue,
  downvoteIssue,
  getUserIssues,
  getDepartmentIssues,
  addFeedback
} = require('../controllers/issueController');
const { protect, department, departmentOrAdmin } = require('../middleware/authMiddleware');
const { uploadIssueImage } = require('../config/cloudinary');

// Public routes
router.get('/', getIssues);
router.get('/:id', getIssueById);

// Protected routes
router.post('/', protect, uploadIssueImage.array('images', 5), createIssue);
router.route('/:id')
  .put(protect, uploadIssueImage.array('images', 5), updateIssue)
  .delete(protect, deleteIssue);

router.post('/:id/upvote', protect, upvoteIssue);
router.post('/:id/downvote', protect, downvoteIssue);
router.put('/:id/feedback', protect, addFeedback);

// User and department specific routes
router.get('/user/issues', protect, getUserIssues);
router.get('/department/issues', protect, departmentOrAdmin, getDepartmentIssues);

module.exports = router;
