const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';

/**
 * Global API limiter — relatively permissive for normal app usage.
 * Tighter in production; relaxed in development.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 300 : 10000,
  message: { success: false, message: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth limiter — strict brute-force protection for login / register.
 * In production: max 10 attempts per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 10 : 100,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts toward the limit
});

/**
 * Route calculation limiter — prevents abuse of compute-heavy endpoint.
 */
const routeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isProd ? 30 : 5000,
  message: { success: false, message: 'Too many route requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, routeLimiter };
