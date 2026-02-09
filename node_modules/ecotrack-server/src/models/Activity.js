const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['energy', 'transport', 'food', 'goods']
  },
  subCategory: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  calculatedCO2: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient querying
activitySchema.index({ userId: 1, date: -1 });
activitySchema.index({ userId: 1, category: 1, date: -1 });

module.exports = mongoose.model('Activity', activitySchema);
