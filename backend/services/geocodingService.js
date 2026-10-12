const axios = require('axios');

const PHOTON_URL = 'https://photon.komoot.io/api';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

/**
 * 100% Dynamic Global Geocoding: Searches ANY place in the world (villages, towns,
 * districts, colleges, streets, landmarks) using live OSM Photon & Nominatim engines.
 * NO static predefined lists.
 */
const geocode = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const q = query.trim();

  // 1. Primary Engine: Komoot Photon (Fast, comprehensive OSM worldwide index, no 429 rate limits)
  try {
    const response = await axios.get(PHOTON_URL, {
      params: {
        q,
        limit: 8,
        lang: 'en',
      },
      timeout: 5000,
      headers: { 'User-Agent': 'TrafficSense/2.0' },
    });

    const features = response.data?.features || [];
    if (features.length > 0) {
      return features.map((f) => {
        const props = f.properties || {};
        const parts = [
          props.name,
          props.district,
          props.city,
          props.state,
          props.country,
        ].filter(Boolean);

        const fullName = parts.join(', ');
        const shortName = props.name || parts[0];
        const lat = f.geometry?.coordinates?.[1];
        const lon = f.geometry?.coordinates?.[0];

        return {
          name: fullName,
          shortName,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          type: props.type || 'place',
          country: props.country,
          state: props.state,
          city: props.city,
        };
      });
    }
  } catch (err) {
    console.warn('Photon geocode fallback:', err.message);
  }

  // 2. Secondary Engine: OpenStreetMap Nominatim
  try {
    const response = await axios.get(`${NOMINATIM_URL}/search`, {
      params: {
        q,
        format: 'json',
        limit: 6,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'TrafficSense-Live-Geocoding-App/2.0 (contact@trafficsense.io)',
        'Accept-Language': 'en',
      },
      timeout: 5000,
    });

    return (response.data || []).map((item) => ({
      name: item.display_name,
      shortName: item.name || item.display_name.split(',')[0],
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type,
      address: item.address,
    }));
  } catch (error) {
    console.error('Nominatim geocode error:', error.message);
    return [];
  }
};

/**
 * 100% Dynamic Reverse Geocoding
 */
const reverseGeocode = async (lat, lng) => {
  // 1. Photon Reverse
  try {
    const response = await axios.get(`${PHOTON_URL}/reverse`, {
      params: { lat, lon: lng },
      timeout: 5000,
      headers: { 'User-Agent': 'TrafficSense/2.0' },
    });

    const f = response.data?.features?.[0];
    if (f) {
      const props = f.properties || {};
      const parts = [props.name, props.district, props.city, props.state, props.country].filter(Boolean);
      return {
        name: parts.join(', '),
        shortName: props.name || parts[0],
        latitude: lat,
        longitude: lng,
      };
    }
  } catch {}

  // 2. Nominatim Reverse
  try {
    const response = await axios.get(`${NOMINATIM_URL}/reverse`, {
      params: { lat, lon: lng, format: 'json' },
      headers: { 'User-Agent': 'TrafficSense-Live/2.0' },
      timeout: 5000,
    });
    return {
      name: response.data.display_name,
      shortName: response.data.name || response.data.display_name.split(',')[0],
      latitude: lat,
      longitude: lng,
    };
  } catch (error) {
    return { name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, latitude: lat, longitude: lng };
  }
};

module.exports = { geocode, reverseGeocode };
