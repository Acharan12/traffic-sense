const jwt = require('jsonwebtoken');
const User = require('../models/User');
const demoStore = require('../utils/demoStore');
const { isDbConnected } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'trafficsense_secret_key');

    if (isDbConnected()) {
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch {
        req.user = demoStore.findUserById(decoded.id);
      }
    } else {
      req.user = demoStore.findUserById(decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'trafficsense_secret_key');
      if (isDbConnected()) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch {
          req.user = demoStore.findUserById(decoded.id);
        }
      } else {
        req.user = demoStore.findUserById(decoded.id);
      }
    } catch (e) {
      // optional — continue without user
    }
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };
