const Group = require('../models/Group');
const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Group name is required'
            });
        }

        const group = await Group.create({
            name,
            description,
            createdBy: req.user._id,
            members: [{
                userId: req.user._id,
                role: 'admin'
            }]
        });

        await group.populate('members.userId', 'name email');

        res.status(201).json({
            success: true,
            group
        });
    } catch (error) {
        console.error('Create group error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create group',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Join group by code
// @route   POST /api/groups/join
// @access  Private
exports.joinGroup = async (req, res) => {
    try {
        const { groupCode } = req.body;

        const group = await Group.findOne({ groupCode: groupCode.toUpperCase() });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Invalid group code'
            });
        }

        // Check if already a member
        const isMember = group.members.some(m => m.userId.toString() === req.user._id.toString());

        if (isMember) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this group'
            });
        }

        group.members.push({
            userId: req.user._id,
            role: 'member'
        });

        await group.save();
        await group.populate('members.userId', 'name email');

        res.json({
            success: true,
            group
        });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to join group'
        });
    }
};

// @desc    Get user's groups
// @route   GET /api/groups
// @access  Private
exports.getMyGroups = async (req, res) => {
    try {
        const groups = await Group.find({
            'members.userId': req.user._id,
            isActive: true
        })
            .populate('members.userId', 'name email')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: groups.length,
            groups
        });
    } catch (error) {
        console.error('Get groups error:', error);
        console.error('Error details:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch groups',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get group leaderboard
// @route   GET /api/groups/:groupId/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { period = 'month' } = req.query; // week, month, all

        const group = await Group.findById(groupId)
            .populate('members.userId', 'name email');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m.userId._id.toString() === req.user._id.toString());
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        // Calculate date range
        let startDate = new Date();
        if (period === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else {
            startDate = new Date(0); // All time
        }

        // Get carbon footprint for each member
        const leaderboard = await Promise.all(
            group.members.map(async (member) => {
                const activities = await Activity.find({
                    userId: member.userId._id,
                    date: { $gte: startDate }
                });

                const totalCO2 = activities.reduce((sum, activity) => sum + activity.calculatedCO2, 0);

                // Category breakdown
                const breakdown = {
                    energy: 0,
                    transport: 0,
                    food: 0,
                    goods: 0
                };

                activities.forEach(activity => {
                    if (breakdown[activity.category] !== undefined) {
                        breakdown[activity.category] += activity.calculatedCO2;
                    }
                });

                return {
                    userId: member.userId._id,
                    name: member.userId.name,
                    email: member.userId.email,
                    totalCO2: Math.round(totalCO2 * 100) / 100,
                    breakdown,
                    activitiesCount: activities.length,
                    joinedAt: member.joinedAt,
                    role: member.role
                };
            })
        );

        // Sort by lowest carbon footprint (winner = lowest emissions)
        leaderboard.sort((a, b) => a.totalCO2 - b.totalCO2);

        // Add rank
        leaderboard.forEach((member, index) => {
            member.rank = index + 1;
            member.isWinner = index === 0;
        });

        res.json({
            success: true,
            group: {
                id: group._id,
                name: group.name,
                groupCode: group.groupCode,
                memberCount: group.members.length
            },
            period,
            leaderboard
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard'
        });
    }
};

// @desc    Leave group
// @route   DELETE /api/groups/:groupId/leave
// @access  Private
exports.leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is the creator
        if (group.createdBy.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Group creator cannot leave. Delete the group instead.'
            });
        }

        group.members = group.members.filter(m => m.userId.toString() !== req.user._id.toString());
        await group.save();

        res.json({
            success: true,
            message: 'Left group successfully'
        });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to leave group'
        });
    }
};

// @desc    Delete group (admin only)
// @route   DELETE /api/groups/:groupId
// @access  Private
exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Only creator can delete
        if (group.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only group creator can delete the group'
            });
        }

        await Group.findByIdAndDelete(groupId);

        res.json({
            success: true,
            message: 'Group deleted successfully'
        });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete group'
        });
    }
};
