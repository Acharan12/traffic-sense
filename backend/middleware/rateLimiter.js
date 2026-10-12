const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

// Skip rate limiting completely in development mode so dev testing never triggers 429
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  skip: () => isDev,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: () => isDev,
  message: { success: false, message: 'Too many authentication attempts, please try again in 15 minutes.' },
});

const routeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5000,
  skip: () => isDev,
  message: { success: false, message: 'Too many route requests, please slow down.' },
});

module.exports = { apiLimiter, authLimiter, routeLimiter };


