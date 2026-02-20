const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const CalculationEngine = require('../utils/calculationEngine');
const RecommendationEngine = require('../utils/recommendationEngine');

// @desc    Get current goal
// @route   GET /api/goals/current
// @access  Private
exports.getCurrentGoal = async (req, res) => {
  try {
    const now = new Date();
    let goal = await Goal.findOne({
      userId: req.user._id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    if (!goal) {
      goal = await Goal.create({
        userId: req.user._id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        monthlyLimit: 500,
      });
    }

    // Calculate percentage
    const percentage = Math.round((goal.currentTotal / goal.monthlyLimit) * 100);

    res.json({
      success: true,
      goal: {
        ...goal.toObject(),
        percentage,
        remaining: Math.max(0, goal.monthlyLimit - goal.currentTotal),
      },
    });
  } catch (error) {
    console.error('Get current goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching goal',
    });
  }
};

// @desc    Update goal limit
// @route   PUT /api/goals/limit
// @access  Private
exports.updateGoalLimit = async (req, res) => {
  try {
    const { monthlyLimit } = req.body;

    if (!monthlyLimit || monthlyLimit < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid monthly limit',
      });
    }

    const now = new Date();
    let goal = await Goal.findOne({
      userId: req.user._id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    if (!goal) {
      goal = await Goal.create({
        userId: req.user._id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        monthlyLimit,
      });
    } else {
      goal.monthlyLimit = monthlyLimit;
      goal.dailyLimit = Math.round(monthlyLimit / 30);
      goal.updateStatus();
      await goal.save();
    }

    const percentage = Math.round((goal.currentTotal / goal.monthlyLimit) * 100);

    res.json({
      success: true,
      goal: {
        ...goal.toObject(),
        percentage,
        remaining: Math.max(0, goal.monthlyLimit - goal.currentTotal),
      },
    });
  } catch (error) {
    console.error('Update goal limit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating goal',
    });
  }
};

// @desc    Get goal history
// @route   GET /api/goals/history
// @access  Private
exports.getGoalHistory = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id })
      .sort({ year: -1, month: -1 })
      .limit(12);

    res.json({
      success: true,
      goals: goals.map((goal) => ({
        ...goal.toObject(),
        percentage: Math.round((goal.currentTotal / goal.monthlyLimit) * 100),
      })),
    });
  } catch (error) {
    console.error('Get goal history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching goal history',
    });
  }
};

// @desc    Get dashboard data
// @route   GET /api/goals/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get current goal
    let goal = await Goal.findOne({
      userId: req.user._id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    if (!goal) {
      goal = await Goal.create({
        userId: req.user._id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        monthlyLimit: 500,
      });
    }

    // Get monthly activities
    const activities = await Activity.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Get recent activities (global)
    const recentActivitesList = await Activity.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    // Calculate category totals
    const categoryTotals = CalculationEngine.calculateTotal(activities);

    // Get today's total
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const todayActivities = activities.filter(
      (a) => a.date >= startOfDay && a.date <= endOfDay
    );
    const todayTotal = CalculationEngine.calculateTotal(todayActivities);

    // Generate recommendations
    const recommendations = RecommendationEngine.generateRecommendations({
      activities,
      goal,
      categoryTotals,
    });

    // Calculate comparison to previous month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const lastMonthActivities = await Activity.find({
      userId: req.user._id,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });
    const lastMonthTotal = CalculationEngine.calculateTotal(lastMonthActivities);

    const comparison = lastMonthTotal.total > 0
      ? Math.round(((categoryTotals.total - lastMonthTotal.total) / lastMonthTotal.total) * 100)
      : 0;

    res.json({
      success: true,
      dashboard: {
        goal: {
          ...goal.toObject(),
          percentage: Math.round((goal.currentTotal / goal.monthlyLimit) * 100),
          remaining: Math.max(0, goal.monthlyLimit - goal.currentTotal),
        },
        today: {
          total: todayTotal.total,
          dailyLimit: goal.dailyLimit,
          percentage: Math.round((todayTotal.total / goal.dailyLimit) * 100),
        },
        monthly: {
          ...categoryTotals,
          comparison,
          comparisonLabel: comparison >= 0 ? 'increase' : 'decrease',
        },
        recommendations,
        streak: {
          current: req.user.streak?.current || 0,
          longest: req.user.streak?.longest || 0,
          badges: req.user.badges || []
        },
        recentActivities: recentActivitesList,
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard',
    });
  }
};

// @desc    Get emission factors
// @route   GET /api/goals/emission-factors
// @access  Public
exports.getEmissionFactors = async (req, res) => {
  try {
    const factors = CalculationEngine.getEmissionFactors();
    res.json({
      success: true,
      factors,
    });
  } catch (error) {
    console.error('Get emission factors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching emission factors',
    });
  }
};
