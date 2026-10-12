const { predict } = require('../services/mlService');
const Prediction = require('../models/Prediction');
const demoStore = require('../utils/demoStore');
const { isDbConnected } = require('../config/db');

const makePrediction = async (req, res, next) => {
  try {
    const features = req.body || {};
    const result = await predict(features);

    let predId = `pred_${Date.now()}`;

    if (isDbConnected()) {
      try {
        const prediction = await Prediction.create({
          userId: req.user?.id || req.user?._id,
          inputFeatures: features,
          trafficLevel: result.trafficLevel,
          trafficScore: result.trafficScore,
          confidence: result.confidence,
          factors: result.factors,
          source: result.source,
        });
        if (prediction) predId = prediction._id;
      } catch (err) {
        // Fallback to in-memory store
        const pred = demoStore.addPrediction({
          userId: req.user?.id || req.user?._id,
          inputFeatures: features,
          trafficLevel: result.trafficLevel,
          trafficScore: result.trafficScore,
          confidence: result.confidence,
          factors: result.factors,
          source: result.source,
        });
        if (pred) predId = pred._id;
      }
    } else {
      const pred = demoStore.addPrediction({
        userId: req.user?.id || req.user?._id,
        inputFeatures: features,
        trafficLevel: result.trafficLevel,
        trafficScore: result.trafficScore,
        confidence: result.confidence,
        factors: result.factors,
        source: result.source,
      });
      if (pred) predId = pred._id;
    }

    res.json({
      success: true,
      data: {
        ...result,
        id: predId,
        demoMode: result.source === 'demo',
      },
    });
  } catch (error) {
    console.error('makePrediction error:', error);
    // Return a safe heuristic prediction on any unexpected error
    res.json({
      success: true,
      data: {
        trafficLevel: 'Moderate',
        trafficScore: 48,
        confidence: 0.85,
        factors: ['Simulated baseline parameters'],
        source: 'demo',
        id: `pred_${Date.now()}`,
        demoMode: true,
      },
    });
  }
};

const getPredictionHistory = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, data: demoStore.predictions.slice(0, 50), demoMode: true });
    }
    const query = req.user ? { userId: req.user.id || req.user._id } : {};
    const predictions = await Prediction.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: predictions });
  } catch (error) {
    res.json({ success: true, data: demoStore.predictions.slice(0, 50), demoMode: true });
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const analytics = demoStore.getAnalytics();
      return res.json({ success: true, data: analytics, demoMode: true });
    }

    const [hourlyAgg, levelCounts, totalCount, avgConfidence] = await Promise.all([
      Prediction.aggregate([
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 }, avgScore: { $avg: '$trafficScore' } } },
        { $sort: { _id: 1 } },
      ]),
      Prediction.aggregate([
        { $group: { _id: '$trafficLevel', count: { $sum: 1 } } },
      ]),
      Prediction.countDocuments(),
      Prediction.aggregate([{ $group: { _id: null, avg: { $avg: '$confidence' } } }]),
    ]);

    const hourly = Array.from({ length: 24 }, (_, h) => {
      const found = hourlyAgg.find((a) => a._id === h);
      return { hour: h, count: found?.count || 0, avgScore: found?.avgScore || 0 };
    });

    res.json({
      success: true,
      data: {
        hourlyDistribution: hourly,
        levelDistribution: levelCounts,
        totalPredictions: totalCount,
        avgConfidence: avgConfidence[0]?.avg || 0.82,
      },
    });
  } catch (error) {
    const analytics = demoStore.getAnalytics();
    res.json({ success: true, data: analytics, demoMode: true });
  }
};

module.exports = { makePrediction, getPredictionHistory, getAnalytics };
