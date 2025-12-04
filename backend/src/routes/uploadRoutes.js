const express = require('express');
const router = express.Router();
const { uploadIssueImage } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// @desc    Upload status update images
// @route   POST /api/upload/status-images
// @access  Private
router.post('/status-images', protect, uploadIssueImage.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // Extract image URLs from uploaded files
    const imageUrls = req.files.map(file => file.path);

    res.json({
      success: true,
      imageUrls,
      count: imageUrls.length
    });
  } catch (error) {
    console.error('Error uploading status images:', error);
    res.status(500).json({
      message: 'Error uploading images',
      error: error.message
    });
  }
});

module.exports = router;
