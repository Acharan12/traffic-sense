const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const demoStore = require('../utils/demoStore');
const { isDbConnected } = require('../config/db');

/**
 * Generate a signed JWT. JWT_SECRET must exist in environment — no fallback.
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '8h',
  });
};

/**
 * POST /api/auth/register
 * Validates inputs, hashes password, creates user account.
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (!isDbConnected()) {
      // In-memory fallback path
      const exists = demoStore.findUserByEmail(normalizedEmail);
      if (exists) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = demoStore.createUser({ name, email: normalizedEmail, password: hashedPassword, role: 'user' });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token: generateToken(user._id),
        user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role },
      });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalizedEmail, password: hashedPassword });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: generateToken(user._id),
      user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticates user via email + password only — no shortcut aliases.
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isDbConnected()) {
      // In-memory fallback path — strict bcrypt comparison only
      const user = demoStore.findUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      return res.json({
        success: true,
        message: 'Login successful',
        token: generateToken(user._id),
        user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role },
      });
    }

    // MongoDB path — retrieve user with password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    user.lastLogin = new Date();
    await user.save().catch(() => {});

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Returns the profile of the currently authenticated user.
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        favoriteLocations: user.favoriteLocations || [],
        recentSearches: user.recentSearches || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 * Updates profile fields for the authenticated user.
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, favoriteLocations } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (favoriteLocations) updateData.favoriteLocations = favoriteLocations;

    if (!isDbConnected()) {
      const updated = demoStore.updateUser(req.user._id, updateData);
      return res.json({ success: true, message: 'Profile updated', data: updated });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    res.json({
      success: true,
      message: 'Profile updated',
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        favoriteLocations: user.favoriteLocations,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };
