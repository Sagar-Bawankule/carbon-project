const mongoose = require('mongoose');
const crypto = require('crypto');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 200
    },
    groupCode: {
        type: String,
        unique: true,
        uppercase: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate unique 6-character group code
groupSchema.pre('save', async function (next) {
    if (!this.groupCode) {
        let code;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            code = crypto.randomBytes(3).toString('hex').toUpperCase();
            const existing = await mongoose.model('Group').findOne({ groupCode: code });
            if (!existing) isUnique = true;
            attempts++;
        }

        if (!isUnique) {
            return next(new Error('Failed to generate unique group code. Please try again.'));
        }

        this.groupCode = code;
    }
    next();
});

// Index for faster lookups
groupSchema.index({ groupCode: 1 });
groupSchema.index({ 'members.userId': 1 });

module.exports = mongoose.models.Group || mongoose.model('Group', groupSchema);
