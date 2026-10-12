const { fetchRoutes } = require('../services/routeService');
const { batchPredict } = require('../services/mlService');
const { optimizeRoutes } = require('../services/optimizationService');
const { fetchWeather } = require('../services/weatherService');
const { fetchTrafficNews } = require('../services/newsService');
const TrafficIncident = require('../models/TrafficIncident');
const RouteSearch = require('../models/RouteSearch');
const Prediction = require('../models/Prediction');
const demoStore = require('../utils/demoStore');
const { isDbConnected } = require('../config/db');

const calculateRoutes = async (req, res, next) => {
  try {
    const { source, destination, travelMode = 'driving' } = req.body;

    if (!source?.latitude || !destination?.latitude) {
      return res.status(400).json({ success: false, message: 'Source and destination coordinates required' });
    }

    // Geographic bounding box with padding (~30-50 km around route)
    const latSpan = Math.max(0.15, Math.abs(source.latitude - destination.latitude) * 1.5);
    const lngSpan = Math.max(0.15, Math.abs(source.longitude - destination.longitude) * 1.5);
    const centerLat = (source.latitude + destination.latitude) / 2;
    const centerLng = (source.longitude + destination.longitude) / 2;

    const minLat = centerLat - latSpan;
    const maxLat = centerLat + latSpan;
    const minLng = centerLng - lngSpan;
    const maxLng = centerLng + lngSpan;

    // 1. Fetch active incidents
    let allIncidents = [];
    if (isDbConnected()) {
      try {
        allIncidents = await TrafficIncident.find({ active: true });
      } catch {
        allIncidents = demoStore.getActiveIncidents();
      }
    } else {
      allIncidents = demoStore.getActiveIncidents();
    }

    // Filter incidents to those proximate to the route
    const proximateIncidents = allIncidents.filter(
      (inc) => inc.latitude >= minLat && inc.latitude <= maxLat && inc.longitude >= minLng && inc.longitude <= maxLng
    );

    // 2. Fetch verified news traffic & safe zones for the route origin
    const cityName = source.shortName || source.name?.split(',')[0] || 'Vadodara';
    let newsArticles = [];
    try {
      newsArticles = await fetchTrafficNews(cityName);
    } catch {}

    const trafficZones = [];
    const safeZones = [];

    // Extract verified news zones
    newsArticles.forEach((article) => {
      if (article.trafficZone) {
        const tz = article.trafficZone;
        if (tz.center && tz.center[0] >= minLat && tz.center[0] <= maxLat && tz.center[1] >= minLng && tz.center[1] <= maxLng) {
          trafficZones.push(tz);
        }
      }
      if (article.safeZones?.length) {
        article.safeZones.forEach((sz) => {
          if (sz.center && sz.center[0] >= minLat && sz.center[0] <= maxLat && sz.center[1] >= minLng && sz.center[1] <= maxLng) {
            safeZones.push(sz);
          }
        });
      }
    });

    // Also convert proximate severe incidents into traffic impact zones
    proximateIncidents.forEach((inc) => {
      if (inc.severity === 'high' || inc.severity === 'severe') {
        const alreadyAdded = trafficZones.some(
          (tz) => Math.abs(tz.center[0] - inc.latitude) < 0.005 && Math.abs(tz.center[1] - inc.longitude) < 0.005
        );
        if (!alreadyAdded) {
          trafficZones.push({
            center: [inc.latitude, inc.longitude],
            radius: 1100,
            name: inc.title || `${inc.type} Disruption Zone`,
            severity: inc.severity,
            impact: inc.trafficImpact || 75,
            color: '#ef4444',
            description: inc.description || `${inc.location} roadblock. Alternate detour recommended.`,
          });
        }
      }
    });

    // 3. Fetch real road routes from OSRM
    const rawRoutes = await fetchRoutes(source, destination, travelMode, proximateIncidents);

    if (!rawRoutes || rawRoutes.length === 0) {
      return res.status(404).json({ success: false, message: 'No road routes found between these locations' });
    }

    // 4. Fetch weather for optimization
    const weather = await fetchWeather(cityName);

    // 5. Build ML features for each route
    const now = new Date();
    const mlFeatures = rawRoutes.map((route) => ({
      hour: now.getHours(),
      day_of_week: now.getDay(),
      month: now.getMonth() + 1,
      weekend: [0, 6].includes(now.getDay()) ? 1 : 0,
      temperature: weather.temperature || 30,
      rainfall: weather.rainfall || 0,
      weather_condition: weather.condition || 'Clear',
      average_speed: route.estimatedSpeed || 35,
      vehicle_count: Math.round(500 + Math.random() * 700),
      accident: 0,
      construction: 0,
      event: 0,
      road_type: 'urban',
      route_length: route.distance || 10,
    }));

    // 6. Get ML predictions
    const predictions = await batchPredict(mlFeatures);

    // 7. Optimize and score routes with incident avoidance
    const optimizedRoutes = optimizeRoutes(rawRoutes, predictions, proximateIncidents, weather, trafficZones);
    const recommendedRoute = optimizedRoutes[0]?.id;

    // 8. Save search record
    let searchId = `srch_${Date.now()}`;
    const userId = req.user?.id || req.user?._id;

    if (userId) {
      if (isDbConnected()) {
        try {
          const searchRecord = await RouteSearch.create({
            userId,
            source,
            destination,
            travelMode,
            routes: optimizedRoutes,
            recommendedRoute,
            weatherCondition: weather.condition,
          });
          if (searchRecord) searchId = searchRecord._id;

          await Prediction.insertMany(
            optimizedRoutes.map((r, i) => ({
              routeId: r.id,
              userId,
              inputFeatures: mlFeatures[i],
              trafficLevel: r.trafficLevel,
              trafficScore: r.trafficScore,
              confidence: r.confidence,
              factors: r.factors,
              source: predictions[i]?.source || 'demo',
            })),
            { ordered: false }
          ).catch(() => {});
        } catch {}
      } else {
        const saved = demoStore.addSearch({
          userId,
          source,
          destination,
          travelMode,
          recommendedRoute,
          weatherCondition: weather.condition,
        });
        if (saved) searchId = saved._id;
      }
    }

    res.json({
      success: true,
      data: {
        routes: optimizedRoutes,
        recommendedRoute,
        weather,
        incidents: proximateIncidents,
        trafficZones,
        safeZones,
        activeIncidents: proximateIncidents.length,
        demoMode: process.env.DEMO_MODE === 'true' || !isDbConnected(),
        searchId,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRouteHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || 'demo_user_1';

    if (!isDbConnected()) {
      const history = demoStore.getUserSearches(userId);
      return res.json({ success: true, data: history, demoMode: true });
    }

    let history = [];
    try {
      history = await RouteSearch.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('source destination recommendedRoute createdAt travelMode');
    } catch {}

    if (!history || history.length === 0) {
      history = demoStore.getUserSearches(userId);
    }

    res.json({ success: true, data: history });
  } catch (error) {
    res.json({ success: true, data: demoStore.getUserSearches('demo_user_1'), demoMode: true });
  }
};

module.exports = { calculateRoutes, getRouteHistory };
