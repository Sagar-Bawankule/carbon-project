const express = require('express');
const router = express.Router();
const {
    getRewardStatus,
    claimReward
} = require('../controllers/rewardController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Routes
router.get('/status', getRewardStatus);
router.post('/claim', claimReward);

module.exports = router;
