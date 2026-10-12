const express = require('express');
const { getTrafficNews, getTickerNews, verifyIncident } = require('../controllers/newsController');

const router = express.Router();

router.get('/traffic-news', getTrafficNews);
router.get('/ticker', getTickerNews);
router.post('/verify', verifyIncident);

module.exports = router;


