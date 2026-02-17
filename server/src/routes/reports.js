const express = require('express');
const router = express.Router();
const {
    getWeeklyReport,
    getMonthlyReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Routes
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);

module.exports = router;
