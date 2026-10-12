const axios = require('axios');

const TRAFFIC_LABELS = ['Low', 'Moderate', 'High', 'Severe'];
const TRAFFIC_SCORES = { Low: 18, Moderate: 42, High: 67, Severe: 88 };

const predict = async (features) => {
  if (process.env.DEMO_MODE === 'true' || !process.env.ML_SERVICE_URL) {
    return getDemoPrediction(features);
  }

  try {
    const response = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, features, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    const data = response.data;
    // Validate schema
    if (!data.traffic_level || data.confidence === undefined) {
      throw new Error('Invalid ML response schema');
    }

    return {
      trafficLevel: data.traffic_level,
      trafficScore: data.traffic_score || TRAFFIC_SCORES[data.traffic_level],
      confidence: data.confidence,
      factors: data.factors || [],
      source: 'ml_model',
    };
  } catch (error) {
    console.error('ML service error:', error.message);
    return getDemoPrediction(features);
  }
};

const batchPredict = async (featuresArray) => {
  if (process.env.DEMO_MODE === 'true' || !process.env.ML_SERVICE_URL) {
    return featuresArray.map(getDemoPrediction);
  }

  try {
    const response = await axios.post(`${process.env.ML_SERVICE_URL}/batch-predict`, { items: featuresArray }, {
      timeout: 15000,
    });
    return response.data.predictions;
  } catch (error) {
    console.error('ML batch predict error:', error.message);
    return featuresArray.map(getDemoPrediction);
  }
};

const getDemoPrediction = (features) => {
  const hour = features.hour || new Date().getHours();
  const dayOfWeek = features.day_of_week || new Date().getDay();
  const vehicleCount = features.vehicle_count || 500;
  const accident = features.accident || 0;
  const construction = features.construction || 0;
  const rainfall = features.rainfall || 0;
  const speed = features.average_speed || 40;

  // Heuristic prediction
  let score = 20;

  // Rush hour
  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) score += 25;
  else if (hour >= 11 && hour <= 16) score += 10;

  // Weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) score -= 10;

  // Vehicle count
  if (vehicleCount > 1200) score += 25;
  else if (vehicleCount > 800) score += 15;
  else if (vehicleCount > 500) score += 8;

  // Incidents
  if (accident) score += 22;
  if (construction) score += 12;

  // Weather
  if (rainfall > 5) score += 15;
  else if (rainfall > 0) score += 7;

  // Speed (inverse)
  if (speed < 15) score += 20;
  else if (speed < 25) score += 10;
  else if (speed > 50) score -= 10;

  score = Math.max(0, Math.min(100, score));

  let trafficLevel;
  if (score <= 25) trafficLevel = 'Low';
  else if (score <= 50) trafficLevel = 'Moderate';
  else if (score <= 75) trafficLevel = 'High';
  else trafficLevel = 'Severe';

  const factors = [];
  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) factors.push('Rush hour');
  if (vehicleCount > 800) factors.push('High vehicle density');
  if (accident) factors.push('Active accident nearby');
  if (construction) factors.push('Road construction');
  if (rainfall > 0) factors.push('Rainfall reducing visibility');
  if (speed < 25) factors.push('Below-average vehicle speed');
  if (!(dayOfWeek === 0 || dayOfWeek === 6)) factors.push('Weekday traffic');
  if (factors.length === 0) factors.push('Normal traffic conditions');

  return {
    trafficLevel,
    trafficScore: score,
    confidence: 0.72 + Math.random() * 0.2,
    factors,
    source: 'demo',
  };
};

module.exports = { predict, batchPredict };
