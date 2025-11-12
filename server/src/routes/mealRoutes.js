const express = require('express');
const router = express.Router();
const {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
  getMealsByType,
  getFilteredMeals,
  getMealSuggestions,
} = require('../controllers/mealController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateMeal, validateId } = require('../middleware/validation');

// Public routes with optional auth
// @desc    Get all meals (filterable)
// @route   GET /api/v1/meals
// @access  Public
router.get('/', optionalAuth, getMeals);

// @desc    Search meals by name/ingredients
// @route   GET /api/v1/meals/search
// @access  Public
router.get('/search', optionalAuth, getMeals);

// Private routes
// @desc    Get filtered meals for user preferences
// @route   GET /api/v1/meals/filtered
// @access  Private
router.get('/filtered', protect, getFilteredMeals);

// @desc    Get meal suggestions for user
// @route   GET /api/v1/meals/suggestions
// @access  Private
router.get('/suggestions', protect, getMealSuggestions);

// @desc    Get meals by type
// @route   GET /api/v1/meals/type/:mealType
// @access  Public
router.get('/type/:mealType', optionalAuth, getMealsByType);

// @desc    Get meals by dietary preference
// @route   GET /api/v1/meals/diet/:dietType
// @access  Public
router.get('/diet/:dietType', optionalAuth, getMeals);

// Admin routes
// @desc    Create new meal
// @route   POST /api/v1/meals
// @access  Admin
router.post('/', protect, authorize('admin'), validateMeal, createMeal);

// Dynamic routes (must come last)
// @desc    Get specific meal details
// @route   GET /api/v1/meals/:id
// @access  Public
router.get('/:id', validateId, getMeal);

// @desc    Update meal
// @route   PUT /api/v1/meals/:id
// @access  Admin
router.put('/:id', protect, authorize('admin'), validateId, validateMeal, updateMeal);

// @desc    Delete meal
// @route   DELETE /api/v1/meals/:id
// @access  Admin
router.delete('/:id', protect, authorize('admin'), validateId, deleteMeal);

module.exports = router;