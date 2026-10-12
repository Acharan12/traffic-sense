const { fetchWeather } = require('../services/weatherService');

const getCurrentWeather = async (req, res, next) => {
  try {
    const { city = 'Vadodara', lat, lng } = req.query;
    const weather = await fetchWeather(city, lat ? parseFloat(lat) : null, lng ? parseFloat(lng) : null);
    res.json({
      success: true,
      data: weather,
      demoMode: process.env.DEMO_MODE === 'true' || !process.env.WEATHER_API_KEY,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCurrentWeather };
