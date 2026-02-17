const express = require('express');
const router = express.Router();
const {
    getShopItems,
    redeemItem,
    seedShopItems
} = require('../controllers/shopController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

router.get('/items', getShopItems);
router.post('/redeem', redeemItem);
router.post('/seed', seedShopItems); // Helper to seed data

module.exports = router;
