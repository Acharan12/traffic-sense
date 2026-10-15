const express = require('express');
const { getTrafficNews, getTickerNews, verifyIncident } = require('../controllers/newsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All news routes require authentication
router.use(protect);

router.get('/traffic-news', getTrafficNews);
router.get('/ticker', getTickerNews);
router.post('/verify', verifyIncident);

module.exports = router;
