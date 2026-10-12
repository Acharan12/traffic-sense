const express = require('express');
const { getCurrentWeather } = require('../controllers/weatherController');

const router = express.Router();

router.get('/current', getCurrentWeather);

module.exports = router;
