const mongoose = require('mongoose');

const WeatherRecordSchema = new mongoose.Schema({
  city: { type: String, required: true },
  latitude: Number,
  longitude: Number,
  temperature: Number,
  feelsLike: Number,
  rainfall: { type: Number, default: 0 },
  condition: String,
  conditionCode: Number,
  visibility: Number,
  windSpeed: Number,
  humidity: Number,
  icon: String,
  source: { type: String, default: 'openweathermap' },
  timestamp: { type: Date, default: Date.now },
});

WeatherRecordSchema.index({ city: 1, timestamp: -1 });

module.exports = mongoose.model('WeatherRecord', WeatherRecordSchema);
