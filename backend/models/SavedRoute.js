const mongoose = require('mongoose');

const SavedRouteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
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
  preferredMode: { type: String, enum: ['driving', 'walking', 'cycling'], default: 'driving' },
  notes: { type: String, trim: true },
  timesUsed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SavedRoute', SavedRouteSchema);
