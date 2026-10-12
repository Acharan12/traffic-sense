const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  id: String,
  name: String,
  distance: Number,
  duration: Number,
  geometry: mongoose.Schema.Types.Mixed,
  trafficScore: Number,
  trafficLevel: String,
  riskLevel: String,
  routeScore: Number,
  explanation: String,
  incidents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrafficIncident' }],
});

const RouteSearchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: {
    name: String,
    latitude: Number,
    longitude: Number,
    address: String,
  },
  destination: {
    name: String,
    latitude: Number,
    longitude: Number,
    address: String,
  },
  travelMode: { type: String, enum: ['driving', 'walking', 'cycling'], default: 'driving' },
  routes: [RouteSchema],
  recommendedRoute: String,
  weatherCondition: String,
  createdAt: { type: Date, default: Date.now },
});

RouteSearchSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RouteSearch', RouteSearchSchema);
