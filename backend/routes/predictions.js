const express = require('express');
const { makePrediction, getPredictionHistory, getAnalytics } = require('../controllers/predictionsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All prediction routes require authentication
router.use(protect);

router.post('/predict', makePrediction);
router.get('/history', getPredictionHistory);
router.get('/analytics', getAnalytics);

module.exports = router;
