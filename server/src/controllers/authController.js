const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const axios = require('axios');
const User = require('../models/User');
const Goal = require('../models/Goal');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const buildClientRedirectUrl = (params = {}) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const url = new URL('/login', baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: password,
    });

    // Create initial monthly goal
    const now = new Date();
    await Goal.create({
      userId: user._id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      monthlyLimit: 500, // Default sustainable limit
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
        baselineData: user.baselineData,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
        baselineData: user.baselineData,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Complete onboarding
// @route   PUT /api/auth/onboarding
// @access  Private
exports.completeOnboarding = async (req, res) => {
  try {
    const { region, primaryVehicle, householdSize, dietType } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        baselineData: {
          region: region || 'global',
          primaryVehicle: primaryVehicle || 'petrol',
          householdSize: householdSize || 1,
          dietType: dietType || 'average',
        },
        onboardingCompleted: true,
      },
      { new: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
        baselineData: user.baselineData,
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during onboarding',
    });
  }
};

// @desc    Start Google OAuth
// @route   GET /api/auth/google
// @access  Public
exports.googleAuthStart = async (req, res) => {
  try {
    const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL, JWT_SECRET } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CALLBACK_URL || !JWT_SECRET) {
      return res.redirect(buildClientRedirectUrl({ error: 'Google sign-in is not configured' }));
    }

    const state = jwt.sign({ provider: 'google' }, JWT_SECRET, { expiresIn: '10m' });
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
      access_type: 'offline',
      state,
    });

    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch (error) {
    console.error('Google auth start error:', error);
    return res.redirect(buildClientRedirectUrl({ error: 'Unable to start Google sign-in' }));
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleAuthCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;
    const {
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL,
      JWT_SECRET,
    } = process.env;

    if (error) {
      return res.redirect(buildClientRedirectUrl({ error: `Google sign-in failed: ${error}` }));
    }

    if (!code || !state) {
      return res.redirect(buildClientRedirectUrl({ error: 'Missing Google authorization data' }));
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL || !JWT_SECRET) {
      return res.redirect(buildClientRedirectUrl({ error: 'Google sign-in is not configured' }));
    }

    try {
      jwt.verify(state, JWT_SECRET);
    } catch (verifyError) {
      return res.redirect(buildClientRedirectUrl({ error: 'Invalid OAuth state token' }));
    }

    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token: accessToken } = tokenResponse.data;

    if (!accessToken) {
      return res.redirect(buildClientRedirectUrl({ error: 'Google token exchange failed' }));
    }

    const profileResponse = await axios.get('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { email, name, email_verified: emailVerified } = profileResponse.data;

    if (!email || !emailVerified) {
      return res.redirect(buildClientRedirectUrl({ error: 'Google account email is not verified' }));
    }

    let user = await User.findOne({ email });

    if (!user) {
      const fallbackName = email.split('@')[0];
      user = await User.create({
        name: name || fallbackName,
        email,
        passwordHash: crypto.randomBytes(32).toString('hex'),
      });

      const now = new Date();
      await Goal.create({
        userId: user._id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        monthlyLimit: 500,
      });
    }

    const appToken = generateToken(user._id);
    return res.redirect(buildClientRedirectUrl({ token: appToken }));
  } catch (error) {
    console.error('Google auth callback error:', error.response?.data || error.message || error);
    return res.redirect(buildClientRedirectUrl({ error: 'Unable to complete Google sign-in' }));
  }
};
