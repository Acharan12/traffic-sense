require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const TrafficIncident = require('./models/TrafficIncident');
const NewsArticle = require('./models/NewsArticle');
const WeatherRecord = require('./models/WeatherRecord');
const Prediction = require('./models/Prediction');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      TrafficIncident.deleteMany({}),
      NewsArticle.deleteMany({}),
      WeatherRecord.deleteMany({}),
      Prediction.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // --- USERS ---
    // IMPORTANT: Change admin credentials before production!
    const adminPass = await bcrypt.hash('Admin@123', 12);
    const userPass = await bcrypt.hash('User@123', 12);

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@trafficsense.com', password: adminPass, role: 'admin' },
      { name: 'Demo User', email: 'demo@trafficsense.com', password: userPass, role: 'user' },
      { name: 'Arjun Patel', email: 'arjun@example.com', password: userPass, role: 'user' },
      { name: 'Priya Shah', email: 'priya@example.com', password: userPass, role: 'user' },
      { name: 'Rahul Kumar', email: 'rahul@example.com', password: userPass, role: 'user' },
    ]);
    console.log(`✅ Created ${users.length} users`);
    console.log('   📧 Admin: admin@trafficsense.com / Admin@123');
    console.log('   📧 Demo:  demo@trafficsense.com  / User@123');

    // --- TRAFFIC INCIDENTS ---
    const incidents = await TrafficIncident.insertMany([
      { type: 'accident', title: 'Multi-vehicle collision on NH48', description: 'A major accident involving 3 vehicles has blocked the left lane.', location: 'NH48, Vadodara', latitude: 22.3215, longitude: 73.1842, severity: 'high', trafficImpact: 82, affectedRoads: ['NH48'], active: true },
      { type: 'construction', title: 'Road widening work at Alkapuri Circle', description: 'VMC road widening project causing lane restrictions.', location: 'Alkapuri, Vadodara', latitude: 22.3144, longitude: 73.1836, severity: 'moderate', trafficImpact: 58, affectedRoads: ['Alkapuri Circle'], active: true },
      { type: 'congestion', title: 'Heavy traffic at Fatehgunj Flyover', description: 'Morning rush hour congestion at Fatehgunj overbridge.', location: 'Fatehgunj, Vadodara', latitude: 22.3299, longitude: 73.1857, severity: 'moderate', trafficImpact: 65, active: true },
      { type: 'flooding', title: 'Waterlogging on Old Padra Road', description: 'Heavy rainfall causing waterlogging near Old Padra junction.', location: 'Old Padra Road, Vadodara', latitude: 22.2980, longitude: 73.1920, severity: 'high', trafficImpact: 78, active: true },
      { type: 'event', title: 'Cultural event at Sayaji Garden', description: 'Large public event causing parking difficulties and road slowdown.', location: 'Sayaji Garden, Vadodara', latitude: 22.3178, longitude: 73.1905, severity: 'low', trafficImpact: 35, active: true },
      { type: 'road_closure', title: 'VIP convoy route closure - Gotri Road', description: 'Temporary closure for VIP movement from airport to city.', location: 'Gotri Road, Vadodara', latitude: 22.3401, longitude: 73.1733, severity: 'severe', trafficImpact: 90, active: true, expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) },
      { type: 'accident', title: 'Minor fender bender near Karelibaug', description: 'Two-wheeler and auto-rickshaw collision causing minor slowdown.', location: 'Karelibaug, Vadodara', latitude: 22.3050, longitude: 73.1980, severity: 'low', trafficImpact: 28, active: true },
      { type: 'construction', title: 'Metro rail construction - Gorwa', description: 'Underground metro construction causing road narrowing.', location: 'Gorwa, Vadodara', latitude: 22.3451, longitude: 73.1681, severity: 'moderate', trafficImpact: 55, active: true },
    ]);
    console.log(`✅ Created ${incidents.length} traffic incidents`);

    // --- WEATHER RECORD ---
    await WeatherRecord.create({
      city: 'Vadodara', latitude: 22.3072, longitude: 73.1812,
      temperature: 32, feelsLike: 35, rainfall: 2.5,
      condition: 'Light Rain', conditionCode: 500, visibility: 6000,
      windSpeed: 14, humidity: 72, icon: '10d', source: 'seed',
    });
    console.log('✅ Created weather record');

    // --- SEED PREDICTIONS ---
    const hours = [7, 8, 9, 10, 12, 14, 17, 18, 19, 20, 22];
    const levels = ['Low', 'High', 'High', 'Moderate', 'Low', 'Low', 'Severe', 'High', 'High', 'Moderate', 'Low'];
    const scores = [22, 70, 75, 45, 25, 20, 88, 72, 68, 40, 18];

    const predictions = hours.map((h, i) => ({
      inputFeatures: { hour: h, day_of_week: 2, temperature: 31, rainfall: 0, vehicle_count: 600 + i * 50 },
      trafficLevel: levels[i],
      trafficScore: scores[i],
      confidence: 0.78 + Math.random() * 0.18,
      factors: ['Rush hour', 'Weekday traffic'],
      source: 'seed',
      createdAt: new Date(Date.now() - (24 - h) * 60 * 60 * 1000),
    }));
    await Prediction.insertMany(predictions);
    console.log(`✅ Created ${predictions.length} seed predictions`);

    console.log('\n🎉 Seed complete! TrafficSense is ready.\n');
    console.log('⚠️  IMPORTANT: Change admin credentials before deploying to production!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
