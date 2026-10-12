import { useState, useEffect } from 'react';
import {
  Car, Bike, Footprints, AlertTriangle, ShieldCheck,
  TrendingDown, Navigation, Sparkles, Clock, Compass, CloudSun,
  Layers, CheckCircle2, ChevronRight, RefreshCw, Zap
} from 'lucide-react';
import MapView from '../components/map/MapView';
import SearchBar from '../components/ui/SearchBar';
import RouteCard from '../components/ui/RouteCard';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';

const TRAVEL_MODES = [
  { id: 'driving', label: 'Driving', icon: Car },
  { id: 'cycling', label: 'Cycling', icon: Bike },
  { id: 'walking', label: 'Walking', icon: Footprints },
];

export default function RoutePlanner() {
  const { user } = useAuth();
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [travelMode, setTravelMode] = useState('driving');
  const [routes, setRoutes] = useState([]);
  const [recommendedRoute, setRecommendedRoute] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [weather, setWeather] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [trafficZones, setTrafficZones] = useState([]);
  const [safeZones, setSafeZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  const calculateRoutes = async (src = source, dst = destination) => {
    if (!src?.latitude || !dst?.latitude) {
      setError('Please select both starting point and destination.');
      return;
    }
    setLoading(true);
    setError('');
    setRoutes([]);

    try {
      const { data } = await API.post('/routes/calculate', {
        source: src,
        destination: dst,
        travelMode,
      });

      const resData = data.data;
      setRoutes(resData.routes || []);
      setRecommendedRoute(resData.recommendedRoute);
      setSelectedRoute(resData.recommendedRoute);
      setWeather(resData.weather);
      setIncidents(resData.incidents || []);
      setTrafficZones(resData.trafficZones || []);
      setSafeZones(resData.safeZones || []);
      setDemoMode(resData.demoMode);
    } catch (err) {
      setError(err.response?.data?.message || 'Route calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => calculateRoutes();

  const intersectingRoute = routes.find((r) => r.hasAccidentOnRoute);
  const safeDetourRoute = routes.find((r) => r.isRecommended && !r.hasAccidentOnRoute);

  return (
    <div className="min-h-full bg-notion-bg text-notion-text pb-16 font-sans">
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6 pt-6">
        {/* Header Block */}
        <div className="relative mb-2">
          <div className="notion-page-icon">📍</div>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-notion-heading font-serif tracking-tight">
                Multi-Route Optimizer & Hazard Detour
              </h1>
              <p className="text-xs text-notion-muted mt-0.5">
                Turn-by-turn road curves with AI incident detection, congestion impact mapping, and safe detour bypasses.
              </p>
            </div>

            {/* High-Contrast Distinct Travel Mode Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-neutral-200/70 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shadow-sm">
              {TRAVEL_MODES.map(({ id, label, icon: Icon }) => {
                const isActive = travelMode === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTravelMode(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-md scale-[1.03]'
                        : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-300/60 dark:hover:bg-neutral-700/60'
                    }`}
                  >
                    <Icon size={13} className={isActive ? 'text-white dark:text-neutral-950' : 'text-neutral-500 dark:text-neutral-400'} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Properties Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-notion-border text-xs">
            <div className="flex items-center gap-2">
              <span className="text-notion-dim">Engine:</span>
              <span className="notion-pill notion-pill-blue text-[10px]">OSRM Real Roads</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-notion-dim">Mode:</span>
              <span className="capitalize text-notion-heading font-semibold">{travelMode}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-notion-dim">Active Hazards:</span>
              <span className="text-notion-heading font-mono font-bold">
                {trafficZones.length > 0 ? `${trafficZones.length} mapped` : 'None'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-notion-dim">Detour Engine:</span>
              <span className="notion-pill notion-pill-green text-[10px]">Active</span>
            </div>
          </div>
        </div>

        {/* Input Form Card */}
        <div className="notion-card p-4 space-y-4 !overflow-visible relative z-30">
          <div className="flex items-center justify-between border-b border-notion-border pb-2">
            <span className="text-xs font-bold text-notion-heading uppercase tracking-wider">
              Origin & Destination
            </span>
            {demoMode && (
              <span className="notion-pill notion-pill-yellow text-[10px]">
                ⚡ Live Road Geometry
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-notion-heading block">Starting point</label>
              <SearchBar
                placeholder="Search any start city, village, college, road..."
                onSelect={(loc) => {
                  setSource(loc);
                  setError('');
                }}
                value={source?.shortName || source?.name}
                onClear={() => setSource(null)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-notion-heading block">Destination</label>
              <SearchBar
                placeholder="Search any destination city, hub, street..."
                onSelect={(loc) => {
                  setDestination(loc);
                  setError('');
                }}
                value={destination?.shortName || destination?.name}
                onClear={() => setDestination(null)}
              />
            </div>
          </div>

          {error && <div className="notion-callout-red text-xs py-2 px-3">{error}</div>}

          <button
            onClick={handleAnalyze}
            disabled={loading || !source || !destination}
            className="btn-notion-primary w-full justify-center py-2.5 text-xs font-semibold"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Computing Road Corridors & Analyzing AI Incidents...
              </>
            ) : (
              <>
                <Navigation size={14} />
                Analyze & Compare Routes
              </>
            )}
          </button>
        </div>

        {/* AI Detour Callout */}
        {intersectingRoute && safeDetourRoute && (
          <div className="notion-callout-yellow space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 font-semibold text-xs">
              <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>
                Road Hazard Detected on <strong>{intersectingRoute.name}</strong>
              </span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              {intersectingRoute.explanation || 'Heavy congestion / incident reported along the shortest path.'}{' '}
              AI Route Optimizer has calculated an alternative detour:{' '}
              <strong className="text-emerald-700 dark:text-emerald-300">
                {safeDetourRoute.name}
              </strong>{' '}
              which saves ~
              {Math.max(3, intersectingRoute.duration - safeDetourRoute.duration)} mins in traffic delay.
            </p>
          </div>
        )}

        {/* Map View */}
        <div className="notion-card overflow-hidden">
          <div className="p-3 border-b border-notion-border flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Layers size={13} className="text-blue-500" />
              <span className="font-semibold text-notion-heading">
                Live Route & Spatial Hazard Map
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="notion-pill notion-pill-red text-[10px]">
                🔴 Congested Zone
              </span>
              <span className="notion-pill notion-pill-green text-[10px]">
                🟢 Safe Detour Bypass
              </span>
              {weather && (
                <span className="flex items-center gap-1 text-notion-dim">
                  <CloudSun size={12} />
                  {weather.temperature}°C {weather.condition}
                </span>
              )}
            </div>
          </div>

          <div className="h-[460px] w-full">
            <MapView
              source={source}
              destination={destination}
              routes={routes}
              selectedRoute={selectedRoute}
              onSelectRoute={setSelectedRoute}
              trafficZones={trafficZones}
              safeZones={safeZones}
              incidents={incidents}
              height="100%"
            />
          </div>
        </div>

        {/* Routes Comparison Cards */}
        {routes.length > 0 && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-notion-heading uppercase tracking-wider">
                Ranked Route Options ({routes.length})
              </span>
              <span className="text-xs text-notion-dim">
                Select Option A, B, or C below or click any route on the map to highlight its path
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {routes.map((route, idx) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  rank={idx}
                  isSelected={selectedRoute === route.id || (!selectedRoute && route.isRecommended)}
                  onSelect={(r) => setSelectedRoute(r.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
