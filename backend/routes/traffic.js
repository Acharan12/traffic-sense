const express = require('express');
const {
  getCurrentIncidents,
  getNearbyIncidents,
  getHotspots,
  getStats,
} = require('../controllers/trafficController');

const router = express.Router();

router.get('/current', getCurrentIncidents);
router.get('/incidents', getCurrentIncidents);
router.get('/stats', getStats);
router.get('/nearby', getNearbyIncidents);
router.get('/hotspots', getHotspots);

module.exports = router;
