const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  monthlyLimit: {
    type: Number,
    required: true,
    default: 500 // kg CO2e per month (sustainable target)
  },
  dailyLimit: {
    type: Number,
    default: function() {
      return Math.round(this.monthlyLimit / 30);
    }
  },
  status: {
    type: String,
    enum: ['within', 'warning', 'exceeded'],
    default: 'within'
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  currentTotal: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for unique monthly goals per user
goalSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

// Update status based on current total
goalSchema.methods.updateStatus = function() {
  const percentage = (this.currentTotal / this.monthlyLimit) * 100;
  if (percentage >= 100) {
    this.status = 'exceeded';
  } else if (percentage >= 80) {
    this.status = 'warning';
  } else {
    this.status = 'within';
  }
  this.updatedAt = new Date();
};

module.exports = mongoose.model('Goal', goalSchema);
