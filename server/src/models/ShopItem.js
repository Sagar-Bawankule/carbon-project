const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['donation', 'product', 'coupon'],
        required: true
    },
    image: {
        type: String, // URL or local path
        required: true
    },
    data: {
        type: Object, // For storing extra data like discount codes, partner URLs, etc.
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ShopItem', shopItemSchema);
