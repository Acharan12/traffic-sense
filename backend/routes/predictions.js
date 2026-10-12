const express = require('express');
const { makePrediction, getPredictionHistory, getAnalytics } = require('../controllers/predictionsController');
const { optionalAuth, protect } = require('../middleware/auth');

const router = express.Router();

router.post('/predict', optionalAuth, makePrediction);
router.get('/history', protect, getPredictionHistory);
router.get('/analytics', getAnalytics);

module.exports = router;
