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
  addFeedback,
  getSLAStatistics,
  getOverdueIssues,
  checkAndEscalateIssues,
  updateSLADeadline,
  getSLAPgress,
  getDepartmentSuggestion
} = require('../controllers/issueController');
const { protect, department, departmentOrAdmin } = require('../middleware/authMiddleware');
const { uploadIssueImage } = require('../config/cloudinary');

// Public routes
router.get('/', getIssues);
router.get('/:id', getIssueById);

// AI Suggestion route (protected)
router.post('/ai-suggest', protect, getDepartmentSuggestion);

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

// SLA Management routes
router.get('/sla/statistics', protect, departmentOrAdmin, getSLAStatistics);
router.get('/sla/overdue', protect, departmentOrAdmin, getOverdueIssues);
router.post('/sla/escalate', protect, departmentOrAdmin, checkAndEscalateIssues);
router.get('/:id/sla', protect, getSLAPgress);
router.put('/:id/sla', protect, departmentOrAdmin, updateSLADeadline);

module.exports = router;
