const jwt = require('jsonwebtoken');
const User = require('../models/User');
const demoStore = require('../utils/demoStore');
const { isDbConnected } = require('../config/db');

/**
 * protect — strictly requires a valid JWT token.
 * Returns 401 if token is missing, invalid, or expired.
 * No guest / optional-auth fallback is allowed.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in to continue.' });
  }

  // JWT_SECRET MUST come from environment — no hardcoded fallback
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('FATAL: JWT_SECRET environment variable is not set.');
    return res.status(500).json({ success: false, message: 'Server configuration error. Contact administrator.' });
  }

  try {
    const decoded = jwt.verify(token, secret);

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
      return res.status(401).json({ success: false, message: 'Account not found. Please log in again.' });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
  }
};

/**
 * adminOnly — must be used after protect().
 * Ensures the authenticated user has the admin role.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required.' });
  }
};

module.exports = { protect, adminOnly };
