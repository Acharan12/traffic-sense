// Utility helpers for TrafficSense frontend

export const TRAFFIC_LEVELS = {
  Low: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', bar: 'bg-green-500', score: [0, 25] },
  Moderate: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', bar: 'bg-yellow-500', score: [26, 50] },
  High: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', bar: 'bg-red-500', score: [51, 75] },
  Severe: { color: 'text-red-300', bg: 'bg-red-900/30', border: 'border-red-500/40', bar: 'bg-red-700', score: [76, 100] },
};

export const getTrafficLevel = (score) => {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Moderate';
  if (score <= 75) return 'High';
  return 'Severe';
};

export const getTrafficStyle = (level) => TRAFFIC_LEVELS[level] || TRAFFIC_LEVELS.Moderate;

export const INCIDENT_ICONS = {
  accident: '🚗',
  construction: '🚧',
  flooding: '🌊',
  event: '🎭',
  road_closure: '🚫',
  congestion: '🚦',
  other: '⚠️',
};

export const INCIDENT_COLORS = {
  accident: 'incident-accident',
  construction: 'incident-construction',
  flooding: 'incident-flooding',
  event: 'incident-event',
  road_closure: 'incident-road_closure',
  congestion: 'incident-congestion',
  other: 'incident-congestion',
};

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

export const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString();
};

export const formatConfidence = (conf) => `${Math.round(conf * 100)}%`;

export const WEATHER_ICONS = {
  clear: '☀️', partly_cloudy: '⛅', cloudy: '☁️',
  light_rain: '🌦️', heavy_rain: '🌧️', thunderstorm: '⛈️',
  hot_clear: '🌡️', snow: '❄️', fog: '🌫️',
};

export const getWeatherIcon = (condition) => {
  if (!condition) return '🌤️';
  const c = condition.toLowerCase();
  if (c.includes('thunder')) return '⛈️';
  if (c.includes('heavy') && c.includes('rain')) return '🌧️';
  if (c.includes('rain') || c.includes('drizzle')) return '🌦️';
  if (c.includes('snow')) return '❄️';
  if (c.includes('fog') || c.includes('mist')) return '🌫️';
  if (c.includes('cloud')) return '⛅';
  return '☀️';
};

export const debounce = (fn, delay) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};
