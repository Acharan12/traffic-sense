const express = require('express');
const { getCurrentIncidents, getNearbyIncidents, getHotspots, getStats } = require('../controllers/trafficController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All traffic routes require authentication
router.use(protect);

router.get('/current', getCurrentIncidents);
router.get('/incidents', getCurrentIncidents);
router.get('/stats', getStats);
router.get('/nearby', getNearbyIncidents);
router.get('/hotspots', getHotspots);

module.exports = router;
