const mongoose = require('mongoose');

const TrafficIncidentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['accident', 'construction', 'road_closure', 'flooding', 'event', 'congestion', 'other'],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  location: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  severity: {
    type: String,
    enum: ['low', 'moderate', 'high', 'severe'],
    default: 'moderate',
  },
  trafficImpact: { type: Number, min: 0, max: 100, default: 50 },
  affectedRoads: [String],
  source: { type: String, default: 'manual' },
  active: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

TrafficIncidentSchema.index({ latitude: 1, longitude: 1 });
TrafficIncidentSchema.index({ active: 1, timestamp: -1 });

module.exports = mongoose.model('TrafficIncident', TrafficIncidentSchema);
