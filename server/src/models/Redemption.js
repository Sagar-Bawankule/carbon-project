const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shopItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShopItem',
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'cancelled'],
        default: 'completed'
    },
    code: {
        type: String
    }
});

module.exports = mongoose.model('Redemption', redemptionSchema);
