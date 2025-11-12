const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  getAllMeals,
  restoreMeal,
  getDashboardStats,
  getAllMealPlans,
  getAllRecommendations,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// Dashboard statistics
// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
router.get('/stats', getDashboardStats);

// User management
// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
router.get('/users', getUsers);

// @desc    Get user by ID
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', validateId, getUser);

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', validateId, updateUser);

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', validateId, deleteUser);

// @desc    Get user statistics
// @route   GET /api/v1/admin/users/:id/stats
// @access  Private/Admin
router.get('/users/:id/stats', validateId, getUserStats);

// Meal management
// @desc    Get all meals (including inactive)
// @route   GET /api/v1/admin/meals
// @access  Private/Admin
router.get('/meals', getAllMeals);

// @desc    Restore deleted meal
// @route   PUT /api/v1/admin/meals/:id/restore
// @access  Private/Admin
router.put('/meals/:id/restore', validateId, restoreMeal);

// Meal plan management
// @desc    Get all meal plans
// @route   GET /api/v1/admin/meal-plans
// @access  Private/Admin
router.get('/meal-plans', getAllMealPlans);

// Recommendation management
// @desc    Get all recommendations
// @route   GET /api/v1/admin/recommendations
// @access  Private/Admin
router.get('/recommendations', getAllRecommendations);

module.exports = router;
