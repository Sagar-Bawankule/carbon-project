const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  getDailySummary,
  getWeeklyTrends,
  getMonthlyTrends,
} = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Validation rules
const activityValidation = [
  body('category')
    .isIn(['energy', 'transport', 'food', 'goods'])
    .withMessage('Invalid category'),
  body('subCategory').notEmpty().withMessage('Subcategory is required'),
  body('value').isNumeric().withMessage('Value must be a number'),
  body('unit').notEmpty().withMessage('Unit is required'),
];

// Summary and trends routes (must be before /:id)
router.get('/summary/daily', getDailySummary);
router.get('/trends/weekly', getWeeklyTrends);
router.get('/trends/monthly', getMonthlyTrends);

// CRUD routes
router.route('/')
  .get(getActivities)
  .post(activityValidation, createActivity);

router.route('/:id')
  .get(getActivity)
  .put(updateActivity)
  .delete(deleteActivity);

module.exports = router;
