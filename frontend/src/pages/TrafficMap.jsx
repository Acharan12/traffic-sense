import { useState, useEffect } from 'react';
import {
  RefreshCw, Filter, AlertTriangle, Layers, MapPin, Search,
  ShieldCheck, Compass, Globe2
} from 'lucide-react';
import MapView from '../components/map/MapView';
import { RoadDoodle } from '../components/ui/NotionDoodles';
import API from '../api/client';

const CITY_PRESETS = [
  { label: '🇮🇳 Pan-India', center: [21.5000, 78.5000], zoom: 5 },
  { label: 'Vadodara', center: [22.3072, 73.1812], zoom: 12 },
  { label: 'Ahmedabad', center: [23.0225, 72.5714], zoom: 12 },
  { label: 'Mumbai', center: [19.0760, 72.8777], zoom: 11 },
  { label: 'Delhi NCR', center: [28.6139, 77.2090], zoom: 11 },
  { label: 'Bengaluru', center: [12.9716, 77.5946], zoom: 11 },
  { label: 'Hyderabad', center: [17.3850, 78.4867], zoom: 11 },
  { label: 'Surat', center: [21.1702, 72.8311], zoom: 12 },
  { label: 'Pune', center: [18.5204, 73.8567], zoom: 12 },
];

const NATIONWIDE_SAFE_ZONES = [
  { center: [22.3450, 73.1650], radius: 1400, name: 'Gorwa-Gotri Alternate Bypass Corridor (Vadodara)', status: 'Optimal Free-Flow (Speed: 55 km/h)', description: 'Clear arterial bypass corridor.' },
  { center: [23.0500, 72.4800], radius: 1800, name: 'SP Ring Road Western Bypass (Ahmedabad)', status: 'High-Speed Express Flow (Speed: 75 km/h)', description: 'Wide 6-lane bypass free of ground signals.' },
  { center: [19.0544, 72.8402], radius: 2200, name: 'Bandra-Worli Sea Link Corridor (Mumbai)', status: 'High-Speed Sea Link Flow (Speed: 80 km/h)', description: 'Fast coastal bridge corridor.' },
  { center: [28.6100, 77.2600], radius: 2000, name: 'Nizamuddin-Mayur Vihar Arterial Route (Delhi)', status: 'Optimal Free Flow (Speed: 60 km/h)', description: 'Clear arterial river crossing.' },
  { center: [12.8600, 77.6600], radius: 2400, name: 'Electronic City Elevated Tollway (Bengaluru)', status: 'Elevated Signal-Free Corridor (Speed: 75 km/h)', description: 'Smooth elevated highway.' },
  { center: [17.4300, 78.3400], radius: 2200, name: 'Nehru Outer Ring Road (ORR) (Hyderabad)', status: '8-Lane High Speed Bypass (Speed: 90 km/h)', description: 'Open expressway.' },
  { center: [21.1500, 72.7800], radius: 1600, name: 'Dumas-Airport Arterial Corridor (Surat)', status: 'Free-Flowing Avenue (Speed: 60 km/h)', description: 'Optimal bypass avenue.' },
];

export default function TrafficMap() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(CITY_PRESETS[0]);
  const [layerFilter, setLayerFilter] = useState('all'); // all | hazards | safe
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/traffic/incidents?limit=100');
      setIncidents(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (layerFilter === 'safe') return false;
    const matchesQ =
      !searchQuery ||
      inc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQ;
  });

  const displayedSafeZones = layerFilter === 'hazards' ? [] : NATIONWIDE_SAFE_ZONES;

  return (
    <div className="min-h-full bg-notion-bg text-notion-text pb-16 font-sans">
      {/* Minimal Notion Cover */}
      <div className="notion-cover flex items-center justify-between px-8">
        <div>
          <p className="text-xs text-notion-dim font-mono uppercase tracking-wider">National Spatial Grid</p>
          <p className="text-sm font-semibold text-notion-heading font-serif">
            Live Traffic Hotspots & Safe Bypass Corridors Across India
          </p>
        </div>
        <RoadDoodle className="w-20 h-20 opacity-40" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6">
        {/* Header Block */}
        <div className="relative mb-2">
          <div className="notion-page-icon">🗺️</div>
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-notion-heading font-serif tracking-tight">
                Live Traffic & Safe Zone Map (India)
              </h1>
              <p className="text-xs text-notion-muted mt-0.5">
                Real-time congestion bottlenecks, road hazards, and verified safe bypass routes across major Indian hubs.
              </p>
            </div>
            <button
              onClick={fetchIncidents}
              className="btn-notion-secondary text-xs"
              title="Refresh telemetry"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Map</span>
            </button>
          </div>

          {/* City Jump Pills */}
          <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-notion-border flex-wrap text-xs">
            <span className="text-notion-dim mr-1 flex items-center gap-1">
              <Compass size={11} /> Region:
            </span>
            {CITY_PRESETS.map((city) => (
              <button
                key={city.label}
                onClick={() => setSelectedCity(city)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedCity.label === city.label
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                    : 'bg-notion-sidebar border border-notion-border text-notion-muted hover:text-notion-heading'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>

          {/* Layer Filter Row */}
          <div className="flex items-center justify-between gap-3 pt-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-notion-dim mr-1">Layer:</span>
              <button
                onClick={() => setLayerFilter('all')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  layerFilter === 'all'
                    ? 'bg-neutral-800 text-white dark:bg-white dark:text-black font-semibold'
                    : 'text-notion-dim hover:text-notion-heading'
                }`}
              >
                All Zones
              </button>
              <button
                onClick={() => setLayerFilter('hazards')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  layerFilter === 'hazards'
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-notion-dim hover:text-notion-heading'
                }`}
              >
                🔴 Traffic Hotspots ({incidents.length})
              </button>
              <button
                onClick={() => setLayerFilter('safe')}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  layerFilter === 'safe'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-notion-dim hover:text-notion-heading'
                }`}
              >
                🟢 Safe Corridors ({NATIONWIDE_SAFE_ZONES.length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter roads or cities..."
                className="notion-input text-xs py-1 px-2.5 w-48"
              />
            </div>
          </div>
        </div>

        {/* Main Map Block */}
        <div className="notion-card overflow-hidden">
          <div className="p-2.5 border-b border-notion-border flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="font-semibold text-notion-heading flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-500" />
              {selectedCity.label} Geospatial View
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Congested Road Hazard
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Safe Detour Bypass
              </span>
            </div>
          </div>

          <div className="h-[460px] w-full">
            <MapView
              key={`${selectedCity.label}-${layerFilter}`}
              center={selectedCity.center}
              zoom={selectedCity.zoom}
              incidents={filteredIncidents}
              safeZones={displayedSafeZones}
              showHotspots={true}
              height="100%"
            />
          </div>
        </div>

        {/* Database Grid: Left Active Incidents & Right Safe Detours */}
        <div className="grid md:grid-cols-2 gap-4 items-start">
          {/* Active Hazards Table */}
          <div className="notion-card space-y-0">
            <div className="p-3 border-b border-notion-border flex items-center justify-between">
              <span className="text-xs font-semibold text-notion-dim uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={12} />
                Traffic Bottlenecks & Hazards ({filteredIncidents.length})
              </span>
            </div>

            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-notion-border bg-notion-sidebar text-notion-dim text-[11px] sticky top-0">
                    <th className="p-2 font-medium">Location</th>
                    <th className="p-2 font-medium">Severity</th>
                    <th className="p-2 font-medium">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-notion-border">
                  {filteredIncidents.map((inc) => (
                    <tr key={inc._id || inc.id} className="notion-table-row">
                      <td className="p-2 font-medium text-notion-heading">
                        <p className="truncate max-w-[180px]">{inc.title}</p>
                        <p className="text-[10px] text-notion-dim truncate">{inc.location}</p>
                      </td>
                      <td className="p-2">
                        <span
                          className={`notion-pill text-[9px] capitalize ${
                            inc.severity === 'high' || inc.severity === 'severe'
                              ? 'notion-pill-red'
                              : 'notion-pill-yellow'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-notion-heading text-[11px]">{inc.trafficImpact}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verified Safe Corridors List */}
          <div className="notion-card p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-notion-border pb-2">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} />
                Verified Safe Corridors & Bypasses ({NATIONWIDE_SAFE_ZONES.length})
              </span>
              <span className="notion-pill notion-pill-green text-[9px]">Free Flow</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {NATIONWIDE_SAFE_ZONES.map((sz, i) => (
                <div key={i} className="p-2 rounded bg-notion-sidebar border border-emerald-500/20 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-notion-heading text-[11px]">{sz.name}</p>
                    <span className="notion-pill notion-pill-green text-[8px]">Recommended</span>
                  </div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{sz.status}</p>
                  <p className="text-[10px] text-notion-dim">{sz.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
