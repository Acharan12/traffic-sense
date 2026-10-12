const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  routeId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inputFeatures: {
    hour: Number,
    day_of_week: Number,
    month: Number,
    weekend: Number,
    temperature: Number,
    rainfall: Number,
    weather_condition: String,
    average_speed: Number,
    vehicle_count: Number,
    accident: Number,
    construction: Number,
    event: Number,
    road_type: String,
  },
  trafficLevel: { type: String, enum: ['Low', 'Moderate', 'High', 'Severe'] },
  trafficScore: { type: Number, min: 0, max: 100 },
  confidence: { type: Number, min: 0, max: 1 },
  factors: [String],
  modelVersion: { type: String, default: '1.0' },
  source: { type: String, enum: ['ml_model', 'demo', 'fallback', 'seed'], default: 'ml_model' },
  createdAt: { type: Date, default: Date.now },
});

PredictionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Prediction', PredictionSchema);
