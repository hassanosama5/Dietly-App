const express = require('express');
const router = express.Router();
const {
  getProgress,
  getProgressEntry,
  createProgress,
  updateProgress,
  deleteProgress,
  getProgressStats,
  getLatestProgress,
  getProgressTrends,
  addProgressPhotos,
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');
const { validateProgress, validateId } = require('../middleware/validation');

// Specific routes first
// @desc    Get user's progress entries
// @route   GET /api/v1/progress
// @access  Private
router.get('/', protect, getProgress);

// @desc    Create new progress entry
// @route   POST /api/v1/progress
// @access  Private
router.post('/', protect, validateProgress, createProgress);

// @desc    Get progress statistics & analytics
// @route   GET /api/v1/progress/stats
// @access  Private
router.get('/stats', protect, getProgressStats);

// @desc    Get progress trends over time
// @route   GET /api/v1/progress/trends
// @access  Private
router.get('/trends', protect, getProgressTrends);

// @desc    Get latest progress entry
// @route   GET /api/v1/progress/latest
// @access  Private
router.get('/latest', protect, getLatestProgress);

// Dynamic routes
// @desc    Get specific progress entry
// @route   GET /api/v1/progress/:id
// @access  Private
router.get('/:id', protect, validateId, getProgressEntry);

// @desc    Update progress entry
// @route   PUT /api/v1/progress/:id
// @access  Private
router.put('/:id', protect, validateId, validateProgress, updateProgress);

// @desc    Delete progress entry
// @route   DELETE /api/v1/progress/:id
// @access  Private
router.delete('/:id', protect, validateId, deleteProgress);

// @desc    Add progress photos
// @route   POST /api/v1/progress/:id/photos
// @access  Private
router.post('/:id/photos', protect, validateId, addProgressPhotos);

module.exports = router;