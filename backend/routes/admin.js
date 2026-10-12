const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { getUsers, getSystemStats, getIncidents, createIncident, updateIncident, deleteIncident } = require('../controllers/adminController');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/users', getUsers);
router.get('/stats', getSystemStats);
router.get('/incidents', getIncidents);
router.post('/incidents', createIncident);
router.put('/incidents/:id', updateIncident);
router.delete('/incidents/:id', deleteIncident);

module.exports = router;
