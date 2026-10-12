const bcrypt = require('bcryptjs');

// In-memory demo store used when MongoDB is offline or in demo mode
class DemoStore {
  constructor() {
    this.init();
  }

  async init() {
    const adminPass = await bcrypt.hash('Admin@123', 10);
    const userPass = await bcrypt.hash('User@123', 10);

    this.users = [
      {
        _id: 'usr_admin_001',
        name: 'Admin User',
        email: 'admin@trafficsense.com',
        password: adminPass,
        role: 'admin',
        createdAt: new Date(Date.now() - 30 * 86400000),
      },
      {
        _id: 'usr_demo_002',
        name: 'Demo User',
        email: 'demo@trafficsense.com',
        password: userPass,
        role: 'user',
        createdAt: new Date(Date.now() - 15 * 86400000),
      },
      {
        _id: 'usr_user_003',
        name: 'Arjun Patel',
        email: 'arjun@example.com',
        password: userPass,
        role: 'user',
        createdAt: new Date(Date.now() - 7 * 86400000),
      },
      {
        _id: 'usr_user_004',
        name: 'Priya Shah',
        email: 'priya@example.com',
        password: userPass,
        role: 'user',
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        _id: 'usr_user_005',
        name: 'Rahul Kumar',
        email: 'rahul@example.com',
        password: userPass,
        role: 'user',
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ];

    // Rich Pan-India Real Road Hazards and Traffic Zones
    this.incidents = [
      // Vadodara
      {
        _id: 'inc_001',
        type: 'accident',
        title: 'Multi-vehicle collision on NH48 Express Bypass',
        description: 'A major accident involving 3 vehicles has blocked 2 lanes near Vadodara bypass.',
        location: 'NH48, Vadodara, Gujarat',
        latitude: 22.3215,
        longitude: 73.1842,
        severity: 'high',
        trafficImpact: 85,
        active: true,
        timestamp: new Date(Date.now() - 25 * 60000),
      },
      {
        _id: 'inc_002',
        type: 'construction',
        title: 'Road widening work at Alkapuri Circle',
        description: 'VMC road widening project causing lane restrictions.',
        location: 'Alkapuri, Vadodara, Gujarat',
        latitude: 22.3144,
        longitude: 73.1836,
        severity: 'moderate',
        trafficImpact: 58,
        active: true,
        timestamp: new Date(Date.now() - 120 * 60000),
      },
      {
        _id: 'inc_003',
        type: 'congestion',
        title: 'Heavy traffic at Fatehgunj Flyover',
        description: 'Peak hour congestion at Fatehgunj overbridge.',
        location: 'Fatehgunj, Vadodara, Gujarat',
        latitude: 22.3299,
        longitude: 73.1857,
        severity: 'moderate',
        trafficImpact: 65,
        active: true,
        timestamp: new Date(Date.now() - 45 * 60000),
      },
      {
        _id: 'inc_004',
        type: 'flooding',
        title: 'Waterlogging on Old Padra Road',
        description: 'Heavy rainfall causing water accumulation near Old Padra junction.',
        location: 'Old Padra Road, Vadodara, Gujarat',
        latitude: 22.2980,
        longitude: 73.1920,
        severity: 'high',
        trafficImpact: 78,
        active: true,
        timestamp: new Date(Date.now() - 90 * 60000),
      },

      // Ahmedabad
      {
        _id: 'inc_009',
        type: 'accident',
        title: 'SG Highway Iskcon Flyover Gridlock',
        description: 'Three car pileup on SG Highway near Iskcon. Traffic diverted to SP Ring Road.',
        location: 'SG Highway, Ahmedabad, Gujarat',
        latitude: 23.0298,
        longitude: 72.5074,
        severity: 'high',
        trafficImpact: 82,
        active: true,
        timestamp: new Date(Date.now() - 40 * 60000),
      },
      {
        _id: 'inc_010',
        type: 'construction',
        title: 'Ashram Road Metro Phase-2 Civil Work',
        description: 'Lane narrowing in progress near Usmanpura for metro pillar installation.',
        location: 'Ashram Road, Ahmedabad, Gujarat',
        latitude: 23.0450,
        longitude: 72.5700,
        severity: 'moderate',
        trafficImpact: 60,
        active: true,
        timestamp: new Date(Date.now() - 150 * 60000),
      },

      // Mumbai
      {
        _id: 'inc_011',
        type: 'accident',
        title: 'Western Express Highway Truck Breakdown',
        description: 'Overturned commercial freight truck on WEH near Andheri East flyover.',
        location: 'Western Express Highway, Andheri, Mumbai',
        latitude: 19.1136,
        longitude: 72.8697,
        severity: 'severe',
        trafficImpact: 90,
        active: true,
        timestamp: new Date(Date.now() - 20 * 60000),
      },
      {
        _id: 'inc_012',
        type: 'congestion',
        title: 'Sion-Panvel Expressway Bottleneck',
        description: 'Heavy container movement causing 30-min delays near Vashi toll naka.',
        location: 'Vashi Toll Plaza, Navi Mumbai',
        latitude: 19.0667,
        longitude: 72.9980,
        severity: 'high',
        trafficImpact: 75,
        active: true,
        timestamp: new Date(Date.now() - 60 * 60000),
      },

      // Delhi NCR
      {
        _id: 'inc_013',
        type: 'congestion',
        title: 'DND Flyway Toll Plaza Slowdown',
        description: 'Heavy morning rush towards South Delhi. Outer Ring Road recommended.',
        location: 'DND Flyway, Delhi-Noida Border',
        latitude: 28.5833,
        longitude: 77.3000,
        severity: 'high',
        trafficImpact: 78,
        active: true,
        timestamp: new Date(Date.now() - 35 * 60000),
      },
      {
        _id: 'inc_014',
        type: 'construction',
        title: 'Delhi-Gurgaon NH48 Underpass Expansion',
        description: 'Service lane restricted near Shankar Chowk for drainage development.',
        location: 'NH48, Gurugram, Delhi NCR',
        latitude: 28.4950,
        longitude: 77.0890,
        severity: 'moderate',
        trafficImpact: 55,
        active: true,
        timestamp: new Date(Date.now() - 180 * 60000),
      },

      // Bengaluru
      {
        _id: 'inc_015',
        type: 'congestion',
        title: 'Silk Board Junction Infrastructure Bottleneck',
        description: 'Severe traffic buildup on Outer Ring Road. Take Electronic City elevated tollway.',
        location: 'Silk Board, Bengaluru, Karnataka',
        latitude: 12.9177,
        longitude: 77.6238,
        severity: 'high',
        trafficImpact: 88,
        active: true,
        timestamp: new Date(Date.now() - 30 * 60000),
      },
      {
        _id: 'inc_016',
        type: 'construction',
        title: 'Marathahalli-Whitefield Metro Work',
        description: 'Single lane functional near Kundalahalli gate due to metro pier construction.',
        location: 'Whitefield Main Road, Bengaluru',
        latitude: 12.9698,
        longitude: 77.7499,
        severity: 'moderate',
        trafficImpact: 65,
        active: true,
        timestamp: new Date(Date.now() - 95 * 60000),
      },

      // Hyderabad
      {
        _id: 'inc_017',
        type: 'congestion',
        title: 'HITEC City Cyber Towers Junction Density',
        description: 'Peak shift commuter density around Mindspace. Nehru ORR clear.',
        location: 'HITEC City, Hyderabad, Telangana',
        latitude: 17.4504,
        longitude: 78.3808,
        severity: 'high',
        trafficImpact: 75,
        active: true,
        timestamp: new Date(Date.now() - 40 * 60000),
      },

      // Surat
      {
        _id: 'inc_018',
        type: 'congestion',
        title: 'Surat Ring Road Textile Market Congestion',
        description: 'Heavy cargo lorry movements near Millennium Market.',
        location: 'Ring Road, Surat, Gujarat',
        latitude: 21.1959,
        longitude: 72.8302,
        severity: 'moderate',
        trafficImpact: 65,
        active: true,
        timestamp: new Date(Date.now() - 50 * 60000),
      },

      // Pune
      {
        _id: 'inc_019',
        type: 'accident',
        title: 'Pune-Mumbai Expressway Ghat Section Stalled Vehicle',
        description: 'Heavy vehicle breakdown near Khandala Ghats causing single lane queue.',
        location: 'Mumbai-Pune Expressway, Khandala, Maharashtra',
        latitude: 18.7600,
        longitude: 73.3700,
        severity: 'high',
        trafficImpact: 80,
        active: true,
        timestamp: new Date(Date.now() - 15 * 60000),
      },
    ];

    this.routeSearches = [
      {
        _id: 'srch_001',
        userId: 'usr_demo_002',
        source: { name: 'Vadodara Railway Station', latitude: 22.3119, longitude: 73.1723 },
        destination: { name: 'Parul University', latitude: 22.2887, longitude: 73.1712 },
        travelMode: 'driving',
        recommendedRoute: 'route_b',
        weatherCondition: 'Clear',
        createdAt: new Date(Date.now() - 20 * 60000),
      },
      {
        _id: 'srch_002',
        userId: 'usr_demo_002',
        source: { name: 'Alkapuri', latitude: 22.3144, longitude: 73.1836 },
        destination: { name: 'Sayajigunj', latitude: 22.3178, longitude: 73.1905 },
        travelMode: 'driving',
        recommendedRoute: 'route_a',
        weatherCondition: 'Partly Cloudy',
        createdAt: new Date(Date.now() - 95 * 60000),
      },
    ];

    const hours = [7, 8, 9, 10, 12, 14, 17, 18, 19, 20, 22];
    const levels = ['Low', 'High', 'High', 'Moderate', 'Low', 'Low', 'Severe', 'High', 'High', 'Moderate', 'Low'];
    const scores = [22, 70, 75, 45, 25, 20, 88, 72, 68, 40, 18];

    this.predictions = hours.map((h, i) => ({
      _id: `pred_00${i + 1}`,
      inputFeatures: { hour: h, day_of_week: 2, temperature: 31, rainfall: 0, vehicle_count: 600 + i * 50 },
      trafficLevel: levels[i],
      trafficScore: scores[i],
      confidence: 0.82 + (i % 3) * 0.05,
      factors: ['Rush hour traffic', 'Weather conditions'],
      source: 'demo',
      createdAt: new Date(Date.now() - (24 - h) * 3600000),
    }));
  }

  getUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id) {
    return this.users.find((u) => u._id === id);
  }

  createUser({ name, email, password, role = 'user' }) {
    const newUser = {
      _id: `usr_${Date.now()}`,
      name,
      email,
      password,
      role,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  getActiveIncidents() {
    return this.incidents.filter((i) => i.active);
  }

  createIncident(data) {
    const newInc = {
      _id: `inc_${Date.now()}`,
      ...data,
      active: true,
      timestamp: new Date(),
    };
    this.incidents.unshift(newInc);
    return newInc;
  }

  updateIncident(id, data) {
    const idx = this.incidents.findIndex((i) => i._id === id);
    if (idx === -1) return null;
    this.incidents[idx] = { ...this.incidents[idx], ...data };
    return this.incidents[idx];
  }

  deleteIncident(id) {
    const idx = this.incidents.findIndex((i) => i._id === id);
    if (idx === -1) return false;
    this.incidents.splice(idx, 1);
    return true;
  }

  addSearch(data) {
    const newSearch = {
      _id: `srch_${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
    this.routeSearches.unshift(newSearch);
    return newSearch;
  }

  getUserSearches(userId) {
    return this.routeSearches.filter((s) => s.userId === userId);
  }

  addPrediction(data) {
    const newPred = {
      _id: `pred_${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
    this.predictions.unshift(newPred);
    return newPred;
  }

  getAnalytics() {
    const hourlyDistribution = Array.from({ length: 24 }, (_, h) => {
      const preds = this.predictions.filter((p) => new Date(p.createdAt).getHours() === h);
      const avgScore = preds.length > 0 ? preds.reduce((acc, p) => acc + (p.trafficScore || 0), 0) / preds.length : 0;
      return { hour: h, count: preds.length, avgScore: Math.round(avgScore) };
    });

    const levelCounts = [
      { _id: 'Low', count: this.predictions.filter((p) => p.trafficLevel === 'Low').length },
      { _id: 'Moderate', count: this.predictions.filter((p) => p.trafficLevel === 'Moderate').length },
      { _id: 'High', count: this.predictions.filter((p) => p.trafficLevel === 'High').length },
      { _id: 'Severe', count: this.predictions.filter((p) => p.trafficLevel === 'Severe').length },
    ];

    return {
      hourlyDistribution,
      levelDistribution: levelCounts,
      totalPredictions: this.predictions.length,
      avgConfidence: 0.86,
    };
  }
}

const demoStore = new DemoStore();
module.exports = demoStore;
