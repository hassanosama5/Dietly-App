const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
} = require('../controllers/adminController');
const {
  getProfile,
  calculateNutrition,
  getUserProfileStats,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validateUserUpdate, validateId } = require('../middleware/validation');

// Profile routes (must come before /:id routes)
// @desc    Get current user's full profile
// @route   GET /api/v1/users/profile/me
// @access  Private
router.get('/profile/me', protect, getProfile);

// @desc    Update own profile
// @route   PUT /api/v1/users/profile/update
// @access  Private
router.put('/profile/update', protect, validateUserUpdate, updateProfile);

// @desc    Calculate personalized nutrition needs
// @route   GET /api/v1/users/profile/nutrition
// @access  Private
router.get('/profile/nutrition', protect, calculateNutrition);

// @desc    Get user statistics
// @route   GET /api/v1/users/profile/stats
// @access  Private
router.get('/profile/stats', protect, getUserProfileStats);

// Admin routes
// @desc    Get all users
// @route   GET /api/v1/users
// @access  Admin
router.get('/', protect, authorize('admin'), getUsers);

// @desc    Create user (not implemented yet)
// @route   POST /api/v1/users
// @access  Admin
router.post('/', protect, authorize('admin'), (req, res) => {
  res.status(501).json({ success: false, message: 'Create user not implemented yet' });
});

// Dynamic routes (must come after specific routes)
// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Admin
router.get('/:id', protect, authorize('admin'), validateId, getUser);

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Admin
router.put('/:id', protect, authorize('admin'), validateId, validateUserUpdate, updateUser);

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Admin
router.delete('/:id', protect, authorize('admin'), validateId, deleteUser);

module.exports = router;