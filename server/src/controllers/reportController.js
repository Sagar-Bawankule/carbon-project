const Activity = require('../models/Activity');
const Goal = require('../models/Goal');
const CalculationEngine = require('../utils/calculationEngine');

// @desc    Get weekly report
// @route   GET /api/reports/weekly
// @access  Private
exports.getWeeklyReport = async (req, res) => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        // Get activities for the week
        const activities = await Activity.find({
            userId: req.user._id,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: -1 });

        // Calculate totals by category
        const categoryTotals = {
            energy: 0,
            transport: 0,
            food: 0,
            goods: 0
        };

        const dailyData = {};

        activities.forEach(activity => {
            // Category totals
            if (categoryTotals[activity.category] !== undefined) {
                categoryTotals[activity.category] += activity.calculatedCO2;
            }

            // Daily breakdown
            const dateKey = activity.date.toISOString().split('T')[0];
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = {
                    date: dateKey,
                    total: 0,
                    energy: 0,
                    transport: 0,
                    food: 0,
                    goods: 0,
                    activitiesCount: 0
                };
            }

            dailyData[dateKey].total += activity.calculatedCO2;
            dailyData[dateKey][activity.category] += activity.calculatedCO2;
            dailyData[dateKey].activitiesCount += 1;
        });

        const totalCO2 = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

        // Get previous week for comparison
        const prevWeekEnd = new Date(startDate);
        prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
        const prevWeekStart = new Date(prevWeekEnd);
        prevWeekStart.setDate(prevWeekStart.getDate() - 7);

        const prevActivities = await Activity.find({
            userId: req.user._id,
            date: { $gte: prevWeekStart, $lte: prevWeekEnd }
        });

        const prevWeekTotal = prevActivities.reduce((sum, act) => sum + act.calculatedCO2, 0);
        const weekOverWeekChange = prevWeekTotal > 0
            ? ((totalCO2 - prevWeekTotal) / prevWeekTotal) * 100
            : 0;

        // Top contributors (most impactful activities)
        const topActivities = activities
            .sort((a, b) => b.calculatedCO2 - a.calculatedCO2)
            .slice(0, 5)
            .map(act => ({
                category: act.category,
                subCategory: act.subCategory,
                value: act.value,
                unit: act.unit,
                co2: Math.round(act.calculatedCO2 * 100) / 100,
                date: act.date,
                percentage: (act.calculatedCO2 / totalCO2) * 100
            }));

        // Generate recommendations based on highest category
        const highestCategory = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)[0];

        const recommendations = generateRecommendations(highestCategory[0], categoryTotals);

        // Get current goal
        const currentDate = new Date();
        const goal = await Goal.findOne({
            userId: req.user._id,
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear()
        });

        const dailyAverage = totalCO2 / 7;
        const dailyLimit = goal?.dailyLimit || 17;

        res.json({
            success: true,
            report: {
                period: {
                    startDate,
                    endDate,
                    weekNumber: getWeekNumber(endDate)
                },
                summary: {
                    totalCO2: Math.round(totalCO2 * 100) / 100,
                    dailyAverage: Math.round(dailyAverage * 100) / 100,
                    activitiesLogged: activities.length,
                    dailyLimit,
                    status: dailyAverage <= dailyLimit ? 'on-track' : 'over-limit'
                },
                comparison: {
                    previousWeekTotal: Math.round(prevWeekTotal * 100) / 100,
                    change: Math.round(weekOverWeekChange * 100) / 100,
                    trend: weekOverWeekChange > 0 ? 'increased' : weekOverWeekChange < 0 ? 'decreased' : 'stable'
                },
                categoryBreakdown: {
                    energy: Math.round(categoryTotals.energy * 100) / 100,
                    transport: Math.round(categoryTotals.transport * 100) / 100,
                    food: Math.round(categoryTotals.food * 100) / 100,
                    goods: Math.round(categoryTotals.goods * 100) / 100,
                    percentages: {
                        energy: totalCO2 > 0 ? (categoryTotals.energy / totalCO2) * 100 : 0,
                        transport: totalCO2 > 0 ? (categoryTotals.transport / totalCO2) * 100 : 0,
                        food: totalCO2 > 0 ? (categoryTotals.food / totalCO2) * 100 : 0,
                        goods: totalCO2 > 0 ? (categoryTotals.goods / totalCO2) * 100 : 0
                    }
                },
                dailyBreakdown: Object.values(dailyData).map(day => ({
                    ...day,
                    total: Math.round(day.total * 100) / 100,
                    energy: Math.round(day.energy * 100) / 100,
                    transport: Math.round(day.transport * 100) / 100,
                    food: Math.round(day.food * 100) / 100,
                    goods: Math.round(day.goods * 100) / 100
                })),
                topContributors: topActivities,
                recommendations,
                insights: generateInsights(categoryTotals, dailyAverage, dailyLimit, weekOverWeekChange)
            }
        });
    } catch (error) {
        console.error('Weekly report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate weekly report'
        });
    }
};

// @desc    Get monthly report
// @route   GET /api/reports/monthly
// @access  Private
exports.getMonthlyReport = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const activities = await Activity.find({
            userId: req.user._id,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).sort({ date: -1 });

        const totals = CalculationEngine.calculateTotal(activities);

        const goal = await Goal.findOne({
            userId: req.user._id,
            month: now.getMonth() + 1,
            year: now.getFullYear()
        });

        res.json({
            success: true,
            report: {
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                totalCO2: totals.total,
                monthlyLimit: goal?.monthlyLimit || 500,
                percentage: goal ? (totals.total / goal.monthlyLimit) * 100 : 0,
                breakdown: {
                    energy: totals.energy,
                    transport: totals.transport,
                    food: totals.food,
                    goods: totals.goods
                },
                activitiesCount: activities.length
            }
        });
    } catch (error) {
        console.error('Monthly report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate monthly report'
        });
    }
};

// Helper: Get week number
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Helper: Generate category-specific recommendations
function generateRecommendations(category, totals) {
    const recommendations = {
        energy: [
            { title: 'Switch to LED Bulbs', impact: 'High', description: 'Can reduce energy emissions by 75%' },
            { title: 'Unplug Devices', impact: 'Medium', description: 'Phantom power accounts for 10% of usage' },
            { title: 'Use Natural Light', impact: 'Medium', description: 'Open curtains during daytime' }
        ],
        transport: [
            { title: 'Carpool When Possible', impact: 'High', description: 'Reduce per-person emissions by 50%' },
            { title: 'Use Public Transit', impact: 'High', description: 'Buses produce less CO2 per passenger' },
            { title: 'Combine Errands', impact: 'Medium', description: 'Plan trips to reduce total distance' }
        ],
        food: [
            { title: 'Meatless Mondays', impact: 'High', description: 'Reduce meat consumption one day a week' },
            { title: 'Buy Local Produce', impact: 'Medium', description: 'Reduces transportation emissions' },
            { title: 'Reduce Food Waste', impact: 'High', description: 'Plan meals and use leftovers' }
        ],
        goods: [
            { title: 'Buy Second-Hand', impact: 'High', description: 'Pre-owned items have no new manufacturing emissions' },
            { title: 'Quality Over Quantity', impact: 'Medium', description: 'Durable goods last longer' },
            { title: 'Repair First', impact: 'Medium', description: 'Extend product life before replacing' }
        ]
    };

    return recommendations[category] || [];
}

// Helper: Generate insights
function generateInsights(categoryTotals, dailyAvg, dailyLimit, weekChange) {
    const insights = [];

    // Daily average insight
    if (dailyAvg <= dailyLimit * 0.8) {
        insights.push({
            type: 'success',
            message: `Excellent work! You're well within your daily limit of ${dailyLimit} kg CO₂e.`
        });
    } else if (dailyAvg > dailyLimit) {
        insights.push({
            type: 'warning',
            message: `Daily average (${dailyAvg.toFixed(1)} kg) exceeds your limit. Consider reducing emissions.`
        });
    }

    // Week-over-week trend
    if (weekChange < -10) {
        insights.push({
            type: 'success',
            message: `Great progress! Emissions decreased by ${Math.abs(weekChange).toFixed(1)}% from last week.`
        });
    } else if (weekChange > 10) {
        insights.push({
            type: 'warning',
            message: `Emissions increased by ${weekChange.toFixed(1)}% from last week. Review your activities.`
        });
    }

    // Category-specific insights
    const sortedCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a);

    if (sortedCategories[0][1] > 0) {
        insights.push({
            type: 'info',
            message: `${capitalize(sortedCategories[0][0])} is your largest contributor at ${sortedCategories[0][1].toFixed(1)} kg CO₂e.`
        });
    }

    return insights;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
