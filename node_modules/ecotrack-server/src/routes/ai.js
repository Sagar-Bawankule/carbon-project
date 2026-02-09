const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getGrokRecommendations,
  getQuickTip,
  getIndiaGridCarbonIntensity,
  testAPIConnections,
} = require('../services/indiaEmissionService');
const Activity = require('../models/Activity');
const Goal = require('../models/Goal');

/**
 * @route   GET /api/ai/recommendations
 * @desc    Get AI-powered personalized recommendations
 * @access  Private
 */
router.get('/recommendations', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's monthly stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const activities = await Activity.find({
      user: userId,
      date: { $gte: startOfMonth },
    });
    
    const goal = await Goal.findOne({ user: userId });
    
    // Calculate stats by category
    const stats = {
      energy: 0,
      transport: 0,
      food: 0,
      goods: 0,
      total: 0,
    };
    
    activities.forEach(activity => {
      stats[activity.category] = (stats[activity.category] || 0) + activity.carbonFootprint;
      stats.total += activity.carbonFootprint;
    });
    
    // Prepare user stats for Grok
    const userStats = {
      totalMonthly: stats.total,
      monthlyLimit: goal?.monthlyLimit || 500,
      energy: stats.energy,
      transport: stats.transport,
      food: stats.food,
      goods: stats.goods,
      energyPercent: stats.total > 0 ? Math.round((stats.energy / stats.total) * 100) : 0,
      transportPercent: stats.total > 0 ? Math.round((stats.transport / stats.total) * 100) : 0,
      foodPercent: stats.total > 0 ? Math.round((stats.food / stats.total) * 100) : 0,
      goodsPercent: stats.total > 0 ? Math.round((stats.goods / stats.total) * 100) : 0,
      highestCategory: Object.entries(stats)
        .filter(([key]) => key !== 'total')
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'general',
      state: req.user.state || 'India',
      dietType: req.user.dietType || 'not specified',
      primaryTransport: req.user.primaryTransport || 'not specified',
    };
    
    // Get AI recommendations
    const result = await getGrokRecommendations(userStats);
    
    res.json({
      success: true,
      userStats,
      ...result,
    });
  } catch (error) {
    console.error('AI Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/ai/quick-tip/:category
 * @desc    Get a quick tip for a category
 * @access  Private
 */
router.get('/quick-tip/:category', protect, async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['energy', 'transport', 'food', 'goods', 'general'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Use: energy, transport, food, goods, or general',
      });
    }
    
    const result = await getQuickTip(category);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Quick tip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tip',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/ai/grid-intensity
 * @desc    Get real-time India grid carbon intensity
 * @access  Public
 */
router.get('/grid-intensity', async (req, res) => {
  try {
    const zone = req.query.zone || 'IN';
    const result = await getIndiaGridCarbonIntensity(zone);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Grid intensity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get grid intensity',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/ai/test-connections
 * @desc    Test all API connections
 * @access  Public (for debugging)
 */
router.get('/test-connections', async (req, res) => {
  try {
    const results = await testAPIConnections();
    
    res.json({
      success: true,
      message: 'API connection tests completed',
      results,
      instructions: getSetupInstructions(),
    });
  } catch (error) {
    console.error('API test error:', error);
    res.status(500).json({
      success: false,
      message: 'API tests failed',
      error: error.message,
    });
  }
});

module.exports = router;
