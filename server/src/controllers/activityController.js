const { validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const Goal = require('../models/Goal');
const CalculationEngine = require('../utils/calculationEngine');
const User = require('../models/User');

// @desc    Create new activity
// @route   POST /api/activities
// @access  Private
exports.createActivity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { category, subCategory, value, unit, date, notes } = req.body;

    // Calculate CO2 emissions
    const calculatedCO2 = CalculationEngine.calculate(category, subCategory, value);

    const activity = await Activity.create({
      userId: req.user._id,
      date: date ? new Date(date) : new Date(),
      category,
      subCategory,
      value,
      unit,
      calculatedCO2,
      notes,
    });

    // Update monthly goal
    const activityDate = activity.date;
    await updateGoalTotal(req.user._id, activityDate.getMonth() + 1, activityDate.getFullYear());

    // Update Streak
    const user = await User.findById(req.user._id);
    const activityDay = new Date(activityDate);
    activityDay.setHours(0, 0, 0, 0);

    // Initialize streak if missing
    if (!user.streak) {
      user.streak = { current: 0, longest: 0, lastLogDate: null };
    }

    const lastLogDay = user.streak.lastLogDate ? new Date(user.streak.lastLogDate) : null;
    if (lastLogDay) {
      lastLogDay.setHours(0, 0, 0, 0);
    }

    const oneDay = 24 * 60 * 60 * 1000;

    // Check if this is a new day
    if (!lastLogDay || activityDay.getTime() > lastLogDay.getTime()) {
      if (lastLogDay && (activityDay.getTime() - lastLogDay.getTime() <= oneDay)) {
        // Consecutive day
        user.streak.current += 1;
      } else if (lastLogDay && (activityDay.getTime() - lastLogDay.getTime() > oneDay)) {
        // Break in streak, but only if the activity is strictly after the last log. 
        // If the user logs for today, and last log was 2 days ago, reset.
        user.streak.current = 1;
      } else {
        // First ever log or reset
        user.streak.current = 1;
      }

      // Update max streak
      if (user.streak.current > (user.streak.longest || 0)) {
        user.streak.longest = user.streak.current;
      }

      user.streak.lastLogDate = activityDate;

      // Check badges
      const badges = user.badges || [];
      if (user.streak.current >= 7 && !badges.includes('7-day-streak')) {
        badges.push('7-day-streak');
      }
      if (user.streak.current >= 30 && !badges.includes('30-day-streak')) {
        badges.push('30-day-streak');
      }
      if (user.streak.current >= 100 && !badges.includes('100-day-streak')) {
        badges.push('100-day-streak');
      }
      user.badges = badges;

      await user.save();
    }

    res.status(201).json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating activity',
    });
  }
};

// @desc    Get all activities for user
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res) => {
  try {
    const { startDate, endDate, category, limit = 50, page = 1 } = req.query;

    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await Activity.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      count: activities.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      activities,
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching activities',
    });
  }
};

// @desc    Get activity by ID
// @route   GET /api/activities/:id
// @access  Private
exports.getActivity = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    res.json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching activity',
    });
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private
exports.updateActivity = async (req, res) => {
  try {
    const { category, subCategory, value, unit, date, notes } = req.body;

    let activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    // Recalculate CO2 if values changed
    const newCategory = category || activity.category;
    const newSubCategory = subCategory || activity.subCategory;
    const newValue = value !== undefined ? value : activity.value;

    const calculatedCO2 = CalculationEngine.calculate(newCategory, newSubCategory, newValue);

    activity = await Activity.findByIdAndUpdate(
      req.params.id,
      {
        category: newCategory,
        subCategory: newSubCategory,
        value: newValue,
        unit: unit || activity.unit,
        date: date ? new Date(date) : activity.date,
        notes: notes !== undefined ? notes : activity.notes,
        calculatedCO2,
      },
      { new: true }
    );

    // Update goal totals
    const activityDate = activity.date;
    await updateGoalTotal(req.user._id, activityDate.getMonth() + 1, activityDate.getFullYear());

    res.json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating activity',
    });
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    const activityDate = activity.date;
    await Activity.findByIdAndDelete(req.params.id);

    // Update goal totals
    await updateGoalTotal(req.user._id, activityDate.getMonth() + 1, activityDate.getFullYear());

    res.json({
      success: true,
      message: 'Activity deleted',
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting activity',
    });
  }
};

// @desc    Get daily summary
// @route   GET /api/activities/summary/daily
// @access  Private
exports.getDailySummary = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await Activity.find({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const totals = CalculationEngine.calculateTotal(activities);

    // Get daily limit from current goal
    const now = new Date();
    const goal = await Goal.findOne({
      userId: req.user._id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    res.json({
      success: true,
      date: startOfDay,
      activities: activities.length,
      ...totals,
      dailyLimit: goal?.dailyLimit || 17,
      status: totals.total > (goal?.dailyLimit || 17) ? 'exceeded' : 'within',
    });
  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching daily summary',
    });
  }
};

// @desc    Get weekly trends
// @route   GET /api/activities/trends/weekly
// @access  Private
exports.getWeeklyTrends = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const activities = await Activity.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            category: '$category',
          },
          total: { $sum: '$calculatedCO2' },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Format data for charts
    const trends = {};
    activities.forEach((item) => {
      if (!trends[item._id.date]) {
        trends[item._id.date] = { date: item._id.date, energy: 0, transport: 0, food: 0, goods: 0, total: 0 };
      }
      trends[item._id.date][item._id.category] = Math.round(item.total * 100) / 100;
      trends[item._id.date].total += item.total;
    });

    // Round totals
    Object.values(trends).forEach(day => {
      day.total = Math.round(day.total * 100) / 100;
    });

    res.json({
      success: true,
      startDate,
      endDate,
      trends: Object.values(trends),
    });
  } catch (error) {
    console.error('Weekly trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching weekly trends',
    });
  }
};

// @desc    Get monthly trends
// @route   GET /api/activities/trends/monthly
// @access  Private
exports.getMonthlyTrends = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const activities = await Activity.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            category: '$category',
          },
          total: { $sum: '$calculatedCO2' },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Format data for charts
    const trends = {};
    activities.forEach((item) => {
      if (!trends[item._id.date]) {
        trends[item._id.date] = { date: item._id.date, energy: 0, transport: 0, food: 0, goods: 0, total: 0 };
      }
      trends[item._id.date][item._id.category] = Math.round(item.total * 100) / 100;
      trends[item._id.date].total += item.total;
    });

    // Round totals
    Object.values(trends).forEach(day => {
      day.total = Math.round(day.total * 100) / 100;
    });

    res.json({
      success: true,
      startDate,
      endDate,
      trends: Object.values(trends),
    });
  } catch (error) {
    console.error('Monthly trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching monthly trends',
    });
  }
};

// Helper function to update goal totals
async function updateGoalTotal(userId, month, year) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const result = await Activity.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$calculatedCO2' },
      },
    },
  ]);

  const currentTotal = result.length > 0 ? result[0].total : 0;

  let goal = await Goal.findOne({ userId, month, year });
  if (!goal) {
    goal = await Goal.create({
      userId,
      month,
      year,
      currentTotal,
    });
  } else {
    goal.currentTotal = currentTotal;
    goal.updateStatus();
    await goal.save();
  }

  return goal;
}
