const express = require('express');
const router = express.Router();
const {
  getCurrentGoal,
  updateGoalLimit,
  getGoalHistory,
  getDashboard,
  getEmissionFactors,
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/emission-factors', getEmissionFactors);

// Protected routes
router.use(protect);

router.get('/current', getCurrentGoal);
router.put('/limit', updateGoalLimit);
router.get('/history', getGoalHistory);
router.get('/dashboard', getDashboard);

module.exports = router;
