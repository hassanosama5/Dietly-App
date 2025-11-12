const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getRecommendation,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
  generateRecommendations,
  getActiveRecommendations,
  dismissRecommendation,
  applyRecommendation,
  completeActionStep,
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

// Specific routes first
// @desc    Get all recommendations
// @route   GET /api/v1/recommendations
// @access  Private
router.get('/', protect, getRecommendations);

// @desc    Create manual recommendation
// @route   POST /api/v1/recommendations
// @access  Private
router.post('/', protect, createRecommendation);

// @desc    Get active recommendations
// @route   GET /api/v1/recommendations/active
// @access  Private
router.get('/active', protect, getActiveRecommendations);

// @desc    Get user's recommendations
// @route   GET /api/v1/recommendations/user
// @access  Private
router.get('/user', protect, getRecommendations);

// @desc    Generate AI recommendations
// @route   POST /api/v1/recommendations/generate-ai
// @access  Private
router.post('/generate-ai', protect, generateRecommendations);

// Dynamic routes
// @desc    Get specific recommendation
// @route   GET /api/v1/recommendations/:id
// @access  Private
router.get('/:id', protect, validateId, getRecommendation);

// @desc    Update recommendation
// @route   PUT /api/v1/recommendations/:id
// @access  Private
router.put('/:id', protect, validateId, updateRecommendation);

// @desc    Delete recommendation
// @route   DELETE /api/v1/recommendations/:id
// @access  Private
router.delete('/:id', protect, validateId, deleteRecommendation);

// @desc    Mark recommendation as applied
// @route   PUT /api/v1/recommendations/:id/apply
// @access  Private
router.put('/:id/apply', protect, validateId, applyRecommendation);

// @desc    Dismiss recommendation
// @route   PUT /api/v1/recommendations/:id/dismiss
// @access  Private
router.put('/:id/dismiss', protect, validateId, dismissRecommendation);

// @desc    Mark action step as completed
// @route   PUT /api/v1/recommendations/:id/action-step/:stepIndex
// @access  Private
router.put('/:id/action-step/:stepIndex', protect, validateId, completeActionStep);

module.exports = router;