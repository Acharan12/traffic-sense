const express = require('express');
const { getCurrentWeather } = require('../controllers/weatherController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All weather routes require authentication
router.use(protect);

router.get('/current', getCurrentWeather);

module.exports = router;
