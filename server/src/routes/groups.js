const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
    createGroup,
    joinGroup,
    getMyGroups,
    getLeaderboard,
    leaveGroup,
    deleteGroup
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Validation
const createGroupValidation = [
    body('name').trim().notEmpty().withMessage('Group name is required'),
    body('description').optional().trim()
];

const joinGroupValidation = [
    body('groupCode').trim().notEmpty().withMessage('Group code is required')
];

// Routes
router.post('/', createGroupValidation, createGroup);
router.post('/join', joinGroupValidation, joinGroup);
router.get('/', getMyGroups);
router.get('/:groupId/leaderboard', getLeaderboard);
router.delete('/:groupId/leave', leaveGroup);
router.delete('/:groupId', deleteGroup);

module.exports = router;
