const express = require('express');
const { calculateRoutes, getRouteHistory } = require('../controllers/routesController');
const { protect, optionalAuth } = require('../middleware/auth');
const { routeLimiter } = require('../middleware/rateLimiter');
const { geocode, reverseGeocode } = require('../services/geocodingService');

const router = express.Router();

router.post('/calculate', routeLimiter, optionalAuth, calculateRoutes);
router.get('/history', optionalAuth, getRouteHistory);

// Geocoding endpoints
router.get('/geocode', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query parameter q required' });
    const results = await geocode(q);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

router.get('/reverse-geocode', async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });
    const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
