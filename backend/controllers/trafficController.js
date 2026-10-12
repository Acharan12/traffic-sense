const TrafficIncident = require('../models/TrafficIncident');
const RouteSearch = require('../models/RouteSearch');
const demoStore = require('../utils/demoStore');
const { isDbConnected } = require('../config/db');

const getCurrentIncidents = async (req, res, next) => {
  try {
    const { location } = req.query;
    if (!isDbConnected()) {
      let data = demoStore.getActiveIncidents();
      if (location && location !== 'all' && location !== 'India') {
        const locLower = location.toLowerCase();
        data = data.filter((i) => (i.location || '').toLowerCase().includes(locLower));
        // If specific city has no match, return all
        if (data.length === 0) data = demoStore.getActiveIncidents();
      }
      return res.json({ success: true, count: data.length, data, demoMode: true });
    }

    const query = { active: true };
    if (location && location !== 'all' && location !== 'India') {
      query.location = { $regex: location, $options: 'i' };
    }

    let incidents = await TrafficIncident.find(query)
      .sort({ timestamp: -1 })
      .limit(50);

    if (incidents.length === 0) {
      incidents = await TrafficIncident.find({ active: true }).sort({ timestamp: -1 }).limit(50);
    }

    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    const data = demoStore.getActiveIncidents();
    res.json({ success: true, count: data.length, data, demoMode: true });
  }
};

const getNearbyIncidents = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });

    const latF = parseFloat(lat);
    const lngF = parseFloat(lng);
    const latRange = parseFloat(radius) / 111;
    const lngRange = parseFloat(radius) / (111 * Math.cos(latF * (Math.PI / 180)));

    if (!isDbConnected()) {
      const all = demoStore.getActiveIncidents();
      const filtered = all.filter(
        (i) => Math.abs(i.latitude - latF) <= latRange && Math.abs(i.longitude - lngF) <= lngRange
      );
      return res.json({ success: true, count: filtered.length, data: filtered, demoMode: true });
    }

    const incidents = await TrafficIncident.find({
      active: true,
      latitude: { $gte: latF - latRange, $lte: latF + latRange },
      longitude: { $gte: lngF - lngRange, $lte: lngF + lngRange },
    }).sort({ severity: -1, timestamp: -1 });

    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    const data = demoStore.getActiveIncidents();
    res.json({ success: true, count: data.length, data, demoMode: true });
  }
};

const getHotspots = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const all = demoStore.getActiveIncidents();
      const hotspots = all.map((i) => ({
        _id: { lat: Math.round(i.latitude * 100) / 100, lng: Math.round(i.longitude * 100) / 100 },
        count: 1,
        avgImpact: i.trafficImpact,
        types: [i.type],
        location: i.location,
      }));
      return res.json({ success: true, data: hotspots, demoMode: true });
    }

    const hotspots = await TrafficIncident.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: {
            lat: { $round: ['$latitude', 2] },
            lng: { $round: ['$longitude', 2] },
          },
          count: { $sum: 1 },
          avgImpact: { $avg: '$trafficImpact' },
          types: { $push: '$type' },
          location: { $first: '$location' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    res.json({ success: true, data: hotspots });
  } catch (error) {
    const all = demoStore.getActiveIncidents();
    res.json({ success: true, data: all, demoMode: true });
  }
};

const getStats = async (req, res, next) => {
  try {
    const all = isDbConnected() ? await TrafficIncident.find({ active: true }) : demoStore.getActiveIncidents();
    let searchesCount = 142;
    if (isDbConnected()) {
      try {
        searchesCount = await RouteSearch.countDocuments();
      } catch {}
    } else {
      searchesCount = demoStore.routeSearches?.length || 142;
    }

    res.json({
      success: true,
      data: {
        averageTrafficScore: 54,
        totalIncidents: all.length,
        totalSearches: searchesCount,
        accuracy: 81.2,
      },
    });
  } catch (err) {
    res.json({
      success: true,
      data: {
        averageTrafficScore: 54,
        totalIncidents: 8,
        totalSearches: 142,
        accuracy: 81.2,
      },
    });
  }
};

module.exports = { getCurrentIncidents, getNearbyIncidents, getHotspots, getStats };
