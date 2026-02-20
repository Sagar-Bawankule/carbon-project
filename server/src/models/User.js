const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  baselineData: {
    region: {
      type: String,
      default: 'global'
    },
    primaryVehicle: {
      type: String,
      enum: ['electric', 'hybrid', 'petrol', 'diesel', 'motorcycle', 'public', 'bicycle', 'none'],
      default: 'petrol'
    },
    householdSize: {
      type: Number,
      default: 1
    },
    dietType: {
      type: String,
      enum: ['meatHeavy', 'average', 'pescatarian', 'vegetarian', 'vegan'],
      default: 'average'
    }
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tokens: {
    type: Number,
    default: 0
  },
  monthlyLimit: {
    type: Number,
    default: 500 // 500kg CO2 default limit
  },
  totalCo2Saved: {
    type: Number,
    default: 0
  },
  lastRewardClaimDate: {
    type: Date
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastLogDate: {
      type: Date
    }
  },
  badges: [{
    type: String
  }]
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
