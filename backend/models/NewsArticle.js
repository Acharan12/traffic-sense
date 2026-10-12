const mongoose = require('mongoose');

const NewsArticleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  url: { type: String },
  source: { type: String },
  publishedAt: { type: Date },
  imageUrl: { type: String },
  location: { type: String },
  searchQuery: { type: String },
  aiAnalysis: {
    incidentType: String,
    road: String,
    severity: { type: String, enum: ['low', 'moderate', 'high', 'severe', 'unknown'], default: 'unknown' },
    trafficImpact: { type: Number, min: 0, max: 100 },
    affectedLocation: String,
    direction: String,
    timeRelevance: String,
    confidence: { type: Number, min: 0, max: 1 },
    analyzed: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
});

NewsArticleSchema.index({ createdAt: -1 });
NewsArticleSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('NewsArticle', NewsArticleSchema);
