const axios = require('axios');

/**
 * Fetch real-time traffic incidents from TomTom API.
 * The API requires a bounding box. For a given location, we use an approximate bounding box.
 */
const fetchTomTomIncidents = async (location = 'Vadodara') => {
  const apiKey = process.env.TOMTOM_API_KEY;
  if (!apiKey || apiKey.includes('your_')) {
    return null; // Fallback to demo mode if no key
  }

  // Rough bounding boxes for demo cities
  const bboxes = {
    'Vadodara': '73.08,22.25,73.25,22.38',
    'Ahmedabad': '72.48,22.95,72.65,23.10',
    'Mumbai': '72.75,18.85,73.05,19.30',
    'Delhi': '76.85,28.40,77.35,28.90',
    'Surat': '72.75,21.10,72.90,21.25'
  };

  const bbox = bboxes[location] || bboxes['Vadodara'];

  try {
    const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${apiKey}&bbox=${bbox}&fields={incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code},startTime,endTime,from,to,length,delay}}}`;
    
    const response = await axios.get(url, { timeout: 8000 });
    
    if (response.data && response.data.incidents) {
      return response.data.incidents.map(inc => {
        const props = inc.properties;
        const coords = inc.geometry.coordinates[0]; // LineString, take first point
        const lat = coords[1];
        const lng = coords[0];
        
        let severity = 'moderate';
        if (props.magnitudeOfDelay >= 3) severity = 'high';
        if (props.magnitudeOfDelay === 4) severity = 'severe';
        
        let type = 'congestion';
        if (props.iconCategory === 1) type = 'accident';
        if (props.iconCategory === 9) type = 'construction';
        if (props.iconCategory === 8) type = 'road_closure';

        return {
          type,
          title: props.events?.[0]?.description || 'Traffic Incident',
          description: `Delay: ${props.delay || 0}s. From: ${props.from} To: ${props.to}`,
          location: `${props.from}, ${location}`,
          latitude: lat,
          longitude: lng,
          severity,
          trafficImpact: props.delay > 600 ? 90 : (props.delay > 300 ? 60 : 30),
          active: true,
          source: 'tomtom_api'
        };
      });
    }
  } catch (err) {
    console.error('TomTom API error:', err.message);
  }
  
  return null;
};

module.exports = { fetchTomTomIncidents };
