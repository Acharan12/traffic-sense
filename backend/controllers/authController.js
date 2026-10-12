const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const demoStore = require('../utils/demoStore');
const { isDbConnected } = require('../config/db');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'trafficsense_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (!isDbConnected()) {
      const exists = demoStore.findUserByEmail(normalizedEmail);
      if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = demoStore.createUser({ name, email: normalizedEmail, password: hashedPassword, role: 'user' });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token: generateToken(user._id),
        user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role },
      });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

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

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Fallback/In-memory store check when offline
    if (!isDbConnected()) {
      const user = demoStore.findUserByEmail(normalizedEmail);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const isMatch =
        (await bcrypt.compare(password, user.password).catch(() => false)) ||
        (normalizedEmail === 'admin@trafficsense.com' && (password === 'Admin@123' || password === 'admin' || password === 'admin123')) ||
        (normalizedEmail === 'demo@trafficsense.com' && (password === 'User@123' || password === 'demo' || password === 'demo123'));

      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      return res.json({
        success: true,
        message: 'Login successful',
        token: generateToken(user._id),
        user: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role },
      });
    }

    let user = await User.findOne({ email: normalizedEmail }).select('+password');

    // If user doesn't exist yet in MongoDB Atlas, create default admin/demo on the fly
    if (!user) {
      if (normalizedEmail === 'admin@trafficsense.com') {
        const hashedPassword = await bcrypt.hash('Admin@123', 12);
        user = await User.create({
          name: 'Admin User',
          email: 'admin@trafficsense.com',
          password: hashedPassword,
          role: 'admin',
        });
      } else if (normalizedEmail === 'demo@trafficsense.com') {
        const hashedPassword = await bcrypt.hash('User@123', 12);
        user = await User.create({
          name: 'Demo User',
          email: 'demo@trafficsense.com',
          password: hashedPassword,
          role: 'user',
        });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    // Verify Password (with fallback aliases for admin & demo)
    let isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    if (!isMatch) {
      if (
        (user.email === 'admin@trafficsense.com' && (password === 'Admin@123' || password === 'admin' || password === 'admin123')) ||
        (user.email === 'demo@trafficsense.com' && (password === 'User@123' || password === 'demo' || password === 'demo123'))
      ) {
        isMatch = true;
      }
    }

    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

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
      data: { id: user._id, _id: user._id, name: user.name, email: user.email, role: user.role, favoriteLocations: user.favoriteLocations },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };
