const axios = require('axios');
const NodeCache = require('node-cache');
const WeatherRecord = require('../models/WeatherRecord');

const weatherCache = new NodeCache({ stdTTL: 600 });

const DEMO_WEATHER = {
  city: 'Vadodara',
  temperature: 31,
  feelsLike: 34,
  rainfall: 0,
  condition: 'Partly Cloudy',
  conditionCode: 801,
  visibility: 7000,
  windSpeed: 12,
  humidity: 68,
  icon: '02d',
};

const fetchWeather = async (city = 'Vadodara', lat = null, lng = null) => {
  const cacheKey = `weather_${city}`;
  const cached = weatherCache.get(cacheKey);
  if (cached) return cached;

  const hasValidWeatherKey =
    process.env.WEATHER_API_KEY && !process.env.WEATHER_API_KEY.includes('your_');

  if (process.env.DEMO_MODE === 'true' || !hasValidWeatherKey) {
    weatherCache.set(cacheKey, DEMO_WEATHER);
    return DEMO_WEATHER;
  }

  try {
    const params = lat && lng
      ? { lat, lon: lng, appid: process.env.WEATHER_API_KEY, units: 'metric' }
      : { q: city, appid: process.env.WEATHER_API_KEY, units: 'metric' };

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params,
      timeout: 8000,
    });

    const data = response.data;
    const weatherData = {
      city: data.name,
      latitude: data.coord.lat,
      longitude: data.coord.lon,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      rainfall: data.rain ? data.rain['1h'] || 0 : 0,
      condition: data.weather[0].description,
      conditionCode: data.weather[0].id,
      visibility: data.visibility,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      humidity: data.main.humidity,
      icon: data.weather[0].icon,
    };

    weatherCache.set(cacheKey, weatherData);

    // Persist to DB
    await WeatherRecord.create(weatherData).catch(() => {});

    return weatherData;
  } catch (error) {
    console.error('Weather API error:', error.message);
    return DEMO_WEATHER;
  }
};

// Compute weather risk score for route optimization (0-100)
const getWeatherRisk = (weather) => {
  if (!weather) return 30;
  let risk = 0;

  // Rainfall impact
  if (weather.rainfall > 10) risk += 40;
  else if (weather.rainfall > 5) risk += 25;
  else if (weather.rainfall > 0) risk += 10;

  // Visibility impact
  if (weather.visibility < 1000) risk += 30;
  else if (weather.visibility < 3000) risk += 15;
  else if (weather.visibility < 5000) risk += 5;

  // Wind impact
  if (weather.windSpeed > 50) risk += 20;
  else if (weather.windSpeed > 30) risk += 10;

  // Temperature extremes
  if (weather.temperature > 40 || weather.temperature < 5) risk += 10;

  return Math.min(risk, 100);
};

module.exports = { fetchWeather, getWeatherRisk };
