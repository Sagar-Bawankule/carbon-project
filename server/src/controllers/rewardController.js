const Activity = require('../models/Activity');
const User = require('../models/User');
const Goal = require('../models/Goal');
const mongoose = require('mongoose');

// Get current month's reward status
exports.getRewardStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Aggregate user's CO2 usage for the current month
        const activities = await Activity.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCo2: { $sum: '$calculatedCO2' }
                }
            }
        ]);

        const currentUsage = activities.length > 0 ? activities[0].totalCo2 : 0;

        const user = await User.findById(userId);

        // Fetch Goal to get the accurate monthly limit
        const goal = await Goal.findOne({
            userId,
            month: now.getMonth() + 1,
            year: now.getFullYear()
        });

        const limit = goal?.monthlyLimit || user.monthlyLimit || 500;

        // Calculate potential reward
        // If usage < limit, reward = limit - usage
        // If usage >= limit, reward = 0
        const potentialReward = Math.max(0, limit - currentUsage);

        res.status(200).json({
            currentUsage,
            limit,
            potentialReward,
            tokens: user.tokens,
            message: currentUsage < limit
                ? `You're doing great! You're on track to earn ${potentialReward.toFixed(2)} tokens.`
                : `You've exceeded your monthly limit of ${limit}kg CO2.`
        });

    } catch (error) {
        console.error('Error fetching reward status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Claim reward for the PREVIOUS month
// (To ensure the month is over and data is final)
exports.claimReward = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // Check previous month
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfPrevMonth = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
        const endOfPrevMonth = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0);

        const user = await User.findById(userId);

        // Check if already claimed for previous month
        if (user.lastRewardClaimDate && user.lastRewardClaimDate > startOfPrevMonth) {
            return res.status(400).json({ message: 'Reward for last month already claimed.' });
        }

        // Calculate usage for previous month
        const activities = await Activity.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCo2: { $sum: '$calculatedCO2' }
                }
            }
        ]);

        const monthlyUsage = activities.length > 0 ? activities[0].totalCo2 : 0;

        // Fetch Goal for PREVIOUS month
        const goal = await Goal.findOne({
            userId,
            month: prevMonthDate.getMonth() + 1,
            year: prevMonthDate.getFullYear()
        });

        const limit = goal?.monthlyLimit || user.monthlyLimit || 500;

        const reward = Math.max(0, limit - monthlyUsage);

        if (reward > 0) {
            user.tokens = (user.tokens || 0) + reward;
            user.totalCo2Saved = (user.totalCo2Saved || 0) + reward; // Tracking total saved against limit
            user.lastRewardClaimDate = now;
            await user.save();

            return res.status(200).json({
                success: true,
                reward,
                newBalance: user.tokens,
                message: `Congratulations! You earned ${reward.toFixed(2)} tokens for last month.`
            });
        } else {
            // Mark as claimed even if 0 to prevent re-checking? 
            // Or just let them try again if they delete activities? (Unlikely). 
            // Let's mark as claimed to avoid spamming.
            user.lastRewardClaimDate = now;
            await user.save();

            return res.status(200).json({
                success: true,
                reward: 0,
                newBalance: user.tokens,
                message: `You exceeded your limit last month (${monthlyUsage} / ${limit}). Good luck this month!`
            });
        }

    } catch (error) {
        console.error('Error claiming reward:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
