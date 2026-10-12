const User = require('../models/User');
const TrafficIncident = require('../models/TrafficIncident');
const RouteSearch = require('../models/RouteSearch');
const Prediction = require('../models/Prediction');
const NewsArticle = require('../models/NewsArticle');
const demoStore = require('../utils/demoStore');
const { isDbConnected } = require('../config/db');

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    if (!isDbConnected()) {
      const users = demoStore.getAllUsers(parseInt(limit), parseInt(page));
      return res.json({
        success: true,
        data: users.map((u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })),
        total: demoStore.users.length,
        page: parseInt(page),
        demoMode: true,
      });
    }

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');
    const total = await User.countDocuments();
    res.json({ success: true, data: users, total, page: parseInt(page) });
  } catch (error) {
    const users = demoStore.getAllUsers(20, 1);
    res.json({
      success: true,
      data: users.map((u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })),
      total: demoStore.users.length,
      page: 1,
      demoMode: true,
    });
  }
};

const getSystemStats = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const stats = demoStore.getSystemStats();
      return res.json({ success: true, data: stats, demoMode: true });
    }

    const [userCount, incidentCount, routeCount, predCount, newsCount] = await Promise.all([
      User.countDocuments(),
      TrafficIncident.countDocuments({ active: true }),
      RouteSearch.countDocuments(),
      Prediction.countDocuments(),
      NewsArticle.countDocuments(),
    ]);

    const recentPredictions = await Prediction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('trafficLevel confidence createdAt');

    const levelDist = await Prediction.aggregate([
      { $group: { _id: '$trafficLevel', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        users: userCount,
        activeIncidents: incidentCount,
        totalSearches: routeCount,
        totalPredictions: predCount,
        newsArticles: newsCount,
        recentPredictions,
        levelDistribution: levelDist,
        systemHealth: { api: 'operational', ml: 'operational', db: 'connected' },
      },
    });
  } catch (error) {
    const stats = demoStore.getSystemStats();
    res.json({ success: true, data: stats, demoMode: true });
  }
};

const getIncidents = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const incidents = demoStore.getAllIncidents();
      return res.json({ success: true, data: incidents, demoMode: true });
    }
    const incidents = await TrafficIncident.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, data: incidents });
  } catch (error) {
    const incidents = demoStore.getAllIncidents();
    res.json({ success: true, data: incidents, demoMode: true });
  }
};

const createIncident = async (req, res, next) => {
  try {
    const incidentData = {
      ...req.body,
      createdBy: req.user?.id || req.user?._id,
      source: 'admin',
    };

    if (!isDbConnected()) {
      const incident = demoStore.createIncident(incidentData);
      return res.status(201).json({ success: true, data: incident, demoMode: true });
    }

    const incident = await TrafficIncident.create(incidentData);
    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    const incident = demoStore.createIncident(req.body);
    res.status(201).json({ success: true, data: incident, demoMode: true });
  }
};

const updateIncident = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const incident = demoStore.updateIncident(req.params.id, req.body);
      if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
      return res.json({ success: true, data: incident, demoMode: true });
    }

    const incident = await TrafficIncident.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, data: incident });
  } catch (error) {
    const incident = demoStore.updateIncident(req.params.id, req.body);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, data: incident, demoMode: true });
  }
};

const deleteIncident = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const success = demoStore.deleteIncident(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'Incident not found' });
      return res.json({ success: true, message: 'Incident deleted', demoMode: true });
    }

    const incident = await TrafficIncident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, message: 'Incident deleted' });
  } catch (error) {
    demoStore.deleteIncident(req.params.id);
    res.json({ success: true, message: 'Incident deleted', demoMode: true });
  }
};

module.exports = {
  getUsers,
  getSystemStats,
  getIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
};
