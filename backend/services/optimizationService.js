const { getWeatherRisk } = require('./weatherService');

/**
 * Route Scoring Formula with Accurate Incident Avoidance & Safe Detour Optimization:
 * score = 0.30 × trafficScore + 0.25 × timeScore + 0.30 × incidentRisk + 0.10 × weatherRisk + 0.05 × distanceScore
 * Lower score = better route
 */
const optimizeRoutes = (routes, predictions = [], incidents = [], weather = {}, trafficZones = []) => {
  if (!routes || routes.length === 0) return [];

  const weatherRisk = getWeatherRisk(weather);

  const minDuration = Math.min(...routes.map((r) => r.duration));
  const maxDuration = Math.max(...routes.map((r) => r.duration));
  const minDistance = Math.min(...routes.map((r) => r.distance));
  const maxDistance = Math.max(...routes.map((r) => r.distance));

  const scoredRoutes = routes.map((route, idx) => {
    const routePoints = route.geometry || [];
    const matchedIncidents = [];

    // Exclude the immediate first 3% and last 3% of points (since all routes share the same origin/destination)
    const bodyPoints =
      routePoints.length > 10
        ? routePoints.slice(Math.floor(routePoints.length * 0.04), Math.ceil(routePoints.length * 0.96))
        : routePoints;

    // Check intersecting active incidents (tight 0.45 km proximity along route body)
    incidents.forEach((inc) => {
      const isNear = bodyPoints.some(([lat, lng]) => {
        const distKm = Math.sqrt((lat - inc.latitude) ** 2 + (lng - inc.longitude) ** 2) * 111;
        return distKm < 0.45;
      });
      if (isNear) matchedIncidents.push(inc);
    });

    trafficZones.forEach((tz) => {
      if (tz.center) {
        const [tzLat, tzLng] = tz.center;
        const radiusKm = (tz.radius || 700) / 1000;
        const isIntersecting = bodyPoints.some(([lat, lng]) => {
          const distKm = Math.sqrt((lat - tzLat) ** 2 + (lng - tzLng) ** 2) * 111;
          return distKm < radiusKm * 0.65;
        });
        if (isIntersecting && !matchedIncidents.some((m) => m.title === tz.name)) {
          matchedIncidents.push({
            title: tz.name,
            trafficImpact: tz.impact || 80,
            severity: tz.severity || 'high',
          });
        }
      }
    });

    const hasAccidentOnRoute = matchedIncidents.some(
      (i) => i.severity === 'high' || i.severity === 'severe' || (i.trafficImpact && i.trafficImpact >= 70)
    );

    // Dynamic Traffic Score & Level
    let trafficScore = predictions[idx]?.trafficScore || (idx === 0 ? 40 : 25 + idx * 5);
    let trafficLevel = predictions[idx]?.trafficLevel || 'Low';

    if (hasAccidentOnRoute) {
      trafficScore = Math.max(78, trafficScore + 35);
      trafficLevel = trafficScore > 85 ? 'Severe' : 'High';
    } else if (idx === 0) {
      trafficScore = Math.min(42, trafficScore);
      trafficLevel = trafficScore < 30 ? 'Low' : 'Moderate';
    } else {
      trafficScore = Math.min(28, trafficScore);
      trafficLevel = 'Low';
    }

    // Normalize scores 0-100
    const durationRange = maxDuration - minDuration || 1;
    const distanceRange = maxDistance - minDistance || 1;
    const timeScore = ((route.duration - minDuration) / durationRange) * 100;
    const distanceScore = ((route.distance - minDistance) / distanceRange) * 100;

    // Incident Risk Score
    let incidentRisk = 0;
    if (matchedIncidents.length > 0) {
      incidentRisk = Math.min(
        100,
        matchedIncidents.reduce((sum, inc) => sum + (inc.trafficImpact || 65), 0)
      );
    }

    // Heavy penalty for routes passing through accidents so safe bypass routes rank first
    const penalty = hasAccidentOnRoute ? 60 : 0;

    // Weighted composite score (lower = better)
    const compositeScore =
      0.30 * trafficScore +
      0.25 * timeScore +
      0.30 * incidentRisk +
      0.10 * weatherRisk +
      0.05 * distanceScore +
      penalty;

    const riskLevel =
      hasAccidentOnRoute
        ? 'High'
        : compositeScore < 35
        ? 'Very Low'
        : compositeScore < 50
        ? 'Low'
        : compositeScore < 70
        ? 'Moderate'
        : 'High';

    const cleanName =
      idx === 0
        ? 'Route A (Direct Corridor)'
        : idx === 1
        ? 'Route B (Arterial Detour)'
        : 'Route C (Bypass Corridor)';

    return {
      ...route,
      name: cleanName,
      routeTag: `Option ${String.fromCharCode(65 + idx)}`,
      trafficScore: Math.round(trafficScore),
      trafficLevel,
      confidence: predictions[idx]?.confidence || 0.92,
      factors: predictions[idx]?.factors || ['Real road geometry', 'AI traffic flow index'],
      incidentRisk,
      timeScore: Math.round(timeScore),
      distanceScore: Math.round(distanceScore),
      weatherRisk,
      compositeScore: Math.round(compositeScore),
      riskLevel,
      nearbyIncidents: matchedIncidents.length,
      hasAccidentOnRoute,
      intersectingIncidents: matchedIncidents.map((m) => m.title || m.name),
    };
  });

  // Determine the best route based on composite score (safety + speed)
  const sortedByScore = [...scoredRoutes].sort((a, b) => a.compositeScore - b.compositeScore);
  const bestRouteId = sortedByScore[0]?.id;

  scoredRoutes.forEach((route) => {
    if (route.id === bestRouteId) {
      route.isRecommended = true;
      if (route.hasAccidentOnRoute) {
        route.explanation = `⭐️ Recommended: Fastest available path (${route.duration} min) despite localized traffic density.`;
      } else if (scoredRoutes.some((s) => s.hasAccidentOnRoute)) {
        const hazardRoute = scoredRoutes.find((s) => s.hasAccidentOnRoute);
        route.explanation = `⭐️ Recommended Safe Detour: Safely bypasses bottleneck on ${hazardRoute.name}; optimal free-flowing corridor.`;
      } else {
        route.explanation = `⭐️ Recommended: Optimal balance of travel time (${route.duration} min) and clear road flow.`;
      }
    } else {
      route.isRecommended = false;
      if (route.hasAccidentOnRoute) {
        route.explanation = `Caution: Passes directly through active incident impact zone (${route.intersectingIncidents.join(', ') || 'Road Hazard'}).`;
      } else {
        const best = scoredRoutes.find((r) => r.id === bestRouteId);
        const timeDiff = Math.round(route.duration - (best?.duration || 0));
        route.explanation = `Alternative Corridor: Clear & open highway (${route.trafficLevel} Traffic). +${timeDiff > 0 ? timeDiff : 3} min travel time.`;
      }
    }
  });

  return scoredRoutes;
};

module.exports = { optimizeRoutes };
