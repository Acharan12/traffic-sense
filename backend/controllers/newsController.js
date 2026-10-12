const { fetchTrafficNews, verifyIncidentReport, getLiveNewsTicker } = require('../services/newsService');
const demoStore = require('../utils/demoStore');
const { isDbConnected } = require('../config/db');
const TrafficIncident = require('../models/TrafficIncident');

const getTrafficNews = async (req, res, next) => {
  try {
    const { location = 'Vadodara', limit = 20, fresh = 'false', search = '', category = 'all', page = 1 } = req.query;
    const isFresh = fresh === 'true' || fresh === '1';

    const articles = await fetchTrafficNews(location, {
      fresh: isFresh,
      limit: parseInt(limit),
      search,
      category,
      page: parseInt(page),
    });

    res.json({
      success: true,
      count: articles.length,
      lastRefreshedAt: new Date().toISOString(),
      location,
      data: articles.slice(0, parseInt(limit)),
      demoMode: process.env.DEMO_MODE === 'true' || !process.env.NEWS_API_KEY,
    });
  } catch (error) {
    next(error);
  }
};

const getTickerNews = async (req, res, next) => {
  try {
    const { location = 'Vadodara' } = req.query;
    const tickerItems = await getLiveNewsTicker(location);
    res.json({
      success: true,
      data: tickerItems,
    });
  } catch (error) {
    next(error);
  }
};

const verifyIncident = async (req, res, next) => {
  try {
    const { title, text, location = 'Vadodara', imageUrl } = req.body;

    const analysis = await verifyIncidentReport({
      title,
      text,
      location,
      imageUrl,
    });

    // If verified real and has coordinates, optionally register into active incidents
    if (analysis.isReal && analysis.coordinates) {
      const newIncidentData = {
        type: analysis.incidentType || 'congestion',
        title: analysis.title,
        description: analysis.explanation,
        location: `${analysis.road}, ${location}`,
        latitude: analysis.coordinates.latitude,
        longitude: analysis.coordinates.longitude,
        severity: analysis.severity || 'moderate',
        trafficImpact: analysis.trafficImpact || 55,
        active: true,
        source: 'news_verified',
      };

      if (isDbConnected()) {
        await TrafficIncident.create(newIncidentData).catch(() => {});
      } else {
        demoStore.createIncident(newIncidentData);
      }
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTrafficNews, getTickerNews, verifyIncident };

