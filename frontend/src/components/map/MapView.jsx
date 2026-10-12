import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
import { Maximize2, Minimize2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { INCIDENT_ICONS } from '../../utils';
import { useTheme } from '../../context/ThemeContext';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createIcon = (emoji, bgColor = '#191919', size = 30) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${bgColor};width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.9);box-shadow:0 2px 6px rgba(0,0,0,0.3)">
      <span style="transform:rotate(45deg);font-size:${size * 0.45}px">${emoji}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });

const USER_LOCATION_ICON = L.divIcon({
  className: '',
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
    <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(59,130,246,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
    <div style="position:relative;width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const SOURCE_ICON = createIcon('🔵', '#2563eb');
const DEST_ICON = createIcon('🔴', '#dc2626');
const SAFE_ZONE_ICON = createIcon('🛡️', '#10b981', 28);
const CONGESTION_ZONE_ICON = createIcon('🚨', '#ef4444', 28);

const INCIDENT_ICON_MAP = {
  accident: createIcon('🚗', '#dc2626', 26),
  construction: createIcon('🚧', '#d97706', 26),
  flooding: createIcon('🌊', '#2563eb', 26),
  event: createIcon('🎭', '#7c3aed', 26),
  road_closure: createIcon('🚫', '#ea580c', 26),
  congestion: createIcon('🚦', '#ca8a04', 26),
  other: createIcon('⚠️', '#6b7280', 26),
};

// Distinct colors for Options A, B, C, D, E, F
export const ROUTE_COLOR_PALETTE = [
  { base: '#2563eb', border: 'border-blue-500', dot: 'bg-blue-500', name: 'Option A (Blue)' },
  { base: '#9333ea', border: 'border-purple-600', dot: 'bg-purple-600', name: 'Option B (Purple)' },
  { base: '#ea580c', border: 'border-orange-500', dot: 'bg-orange-500', name: 'Option C (Orange)' },
  { base: '#0891b2', border: 'border-cyan-500', dot: 'bg-cyan-500', name: 'Option D (Cyan)' },
  { base: '#db2777', border: 'border-pink-500', dot: 'bg-pink-500', name: 'Option E (Pink)' },
  { base: '#059669', border: 'border-emerald-600', dot: 'bg-emerald-600', name: 'Option F (Emerald)' },
];

function FitBounds({ boundsPositions, triggerKey }) {
  const map = useMap();
  useEffect(() => {
    if (boundsPositions && boundsPositions.length >= 2) {
      try {
        const bounds = L.latLngBounds(boundsPositions);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
      } catch {}
    }
  }, [triggerKey, map]);
  return null;
}

function PanToCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center?.[0], center?.[1], zoom, map]);
  return null;
}

function MapResizeHandler({ isFullscreen }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    map.invalidateSize();
    return () => clearTimeout(timer);
  }, [isFullscreen, map]);

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleResize);
    document.addEventListener('webkitfullscreenchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
      document.removeEventListener('webkitfullscreenchange', handleResize);
    };
  }, [map]);

  return null;
}

export default function MapView({
  center = [22.3072, 73.1812],
  zoom = 13,
  userLocation,
  source,
  destination,
  routes = [],
  selectedRoute,
  onSelectRoute,
  incidents = [],
  trafficZones = [],
  safeZones = [],
  showHotspots = false,
  height = '100%',
}) {
  const { isDark } = useTheme();
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement && !isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
    };
  }, []);

  // Compute tight bounds around active route or spatial zones
  const boundsPositions = [];
  if (routes.length > 0) {
    routes.forEach((r) => {
      if (r.geometry && r.geometry.length > 0) {
        for (let i = 0; i < r.geometry.length; i += Math.max(1, Math.floor(r.geometry.length / 20))) {
          boundsPositions.push(r.geometry[i]);
        }
      }
    });
  } else {
    if (source?.latitude && source?.longitude) {
      boundsPositions.push([source.latitude, source.longitude]);
    }
    if (destination?.latitude && destination?.longitude) {
      boundsPositions.push([destination.latitude, destination.longitude]);
    }
    if (trafficZones.length > 0) {
      trafficZones.forEach((tz) => {
        if (tz.center) boundsPositions.push(tz.center);
      });
    }
    if (safeZones.length > 0) {
      safeZones.forEach((sz) => {
        if (sz.center) boundsPositions.push(sz.center);
      });
    }
  }

  const initialCenter =
    trafficZones[0]?.center
      ? trafficZones[0].center
      : source?.latitude && source?.longitude
      ? [source.latitude, source.longitude]
      : userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : center;

  const triggerKey = `${initialCenter?.[0]}-${initialCenter?.[1]}-${source?.latitude}-${source?.longitude}-${destination?.latitude}-${destination?.longitude}-${routes.length}-${trafficZones.length}-${safeZones.length}-${selectedRoute}`;

  const tileUrl = isDark
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Sort routes so selected route renders ON TOP of unselected routes
  const sortedRoutesForRender = [...routes].sort((a, b) => {
    const isASelected = selectedRoute === a.id || (!selectedRoute && a.isRecommended);
    const isBSelected = selectedRoute === b.id || (!selectedRoute && b.isRecommended);
    return isASelected ? 1 : isBSelected ? -1 : 0;
  });

  const wrapperStyle = isFullscreen
    ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999, background: isDark ? '#121212' : '#ffffff' }
    : { height, width: '100%' };

  return (
    <div
      ref={containerRef}
      style={wrapperStyle}
      className={`relative overflow-hidden ${isFullscreen ? 'rounded-none shadow-2xl' : 'rounded'}`}
    >
      {/* Top Right Map Control Overlay (Fullscreen toggle + Route Legend) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-2 pointer-events-none">
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit Fullscreen" : "Full Screen Mode"}
          className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-md px-2.5 py-1.5 shadow-md transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none pointer-events-auto"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Fullscreen</span>
            </>
          )}
        </button>

        {/* Route Color Legend Overlay when routes exist */}
        {routes.length > 1 && (
          <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-md p-2 shadow-lg text-[11px] space-y-1 pointer-events-auto">
            <p className="font-bold text-neutral-800 dark:text-neutral-200 text-[10px] uppercase tracking-wider mb-1">
              Route Options
            </p>
            {routes.map((r, i) => {
              const isSelected = selectedRoute === r.id || (!selectedRoute && r.isRecommended);
              const color = r.color || ROUTE_COLOR_PALETTE[i % ROUTE_COLOR_PALETTE.length].base;

              return (
                <div
                  key={r.id || i}
                  onClick={() => onSelectRoute && onSelectRoute(r.id)}
                  className={`flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 rounded transition-colors ${
                    isSelected ? 'bg-neutral-200/90 dark:bg-neutral-800 font-bold' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="w-3.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-neutral-900 dark:text-neutral-100 truncate max-w-[140px]">
                    {r.name.split('(')[0].trim()} ({r.duration}m)
                  </span>
                  {r.isRecommended && <span className="text-[10px]" title="Recommended Route">⭐️</span>}
                  {r.hasAccidentOnRoute && <span className="text-[10px]" title="Hazard on Route">⚠️</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MapContainer
        center={initialCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <MapResizeHandler isFullscreen={isFullscreen} />
        <TileLayer
          key={isDark ? 'dark-tiles' : 'light-tiles'}
          url={tileUrl}
          attribution={isDark ? '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
          subdomains="abc"
          maxZoom={20}
        />

        {/* User Current Live Location Marker */}
        {userLocation?.latitude && userLocation?.longitude && (
          <>
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={USER_LOCATION_ICON}>
              <Popup>
                <div className="p-1 text-xs">
                  <span className="notion-pill notion-pill-blue text-[10px] uppercase font-bold mb-1">
                    📍 Current Location
                  </span>
                  <p className="font-bold text-sm mt-1">{userLocation.name || 'You are here'}</p>
                  <p className="text-[11px] opacity-80 mt-0.5">Live GPS coordinate lock</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={600}
              color="#3b82f6"
              fillColor="#3b82f6"
              fillOpacity={0.12}
              weight={1.5}
            />
          </>
        )}

        {/* Distinct Colored Route Polylines */}
        {sortedRoutesForRender.map((route, idx) => {
          const originalIndex = routes.findIndex((r) => r.id === route.id);
          const isSelected = selectedRoute === route.id || (!selectedRoute && route.isRecommended);
          const isRec = route.isRecommended;

          // Distinct base colors for each option (A, B, C, D, E...)
          const baseColor =
            route.color || ROUTE_COLOR_PALETTE[originalIndex % ROUTE_COLOR_PALETTE.length].base;

          return route.geometry && route.geometry.length > 0 ? (
            <Polyline
              key={route.id || idx}
              positions={route.geometry}
              color={baseColor}
              weight={isSelected ? 7.5 : 4.5}
              opacity={isSelected ? 0.98 : 0.6}
              dashArray={isSelected ? '' : '6,6'}
              eventHandlers={{
                click: () => onSelectRoute && onSelectRoute(route.id),
              }}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <p className="font-bold text-sm mb-1" style={{ color: baseColor }}>
                    {route.name} {isRec ? '⭐️ (Recommended)' : ''}
                  </p>
                  <p className="text-xs">
                    ⏱ <strong>{route.duration} min</strong> · 📍 <strong>{route.distance} km</strong>
                  </p>
                  <p className="text-xs mt-1">
                    🚦 Traffic Level: <strong>{route.trafficLevel}</strong> ({route.trafficScore}/100)
                  </p>
                  {route.explanation && (
                    <p className="text-[11px] mt-1.5 italic opacity-85">
                      {route.explanation}
                    </p>
                  )}
                </div>
              </Popup>
            </Polyline>
          ) : null;
        })}

        {/* Source & Destination */}
        {source?.latitude && source?.longitude && (
          <Marker position={[source.latitude, source.longitude]} icon={SOURCE_ICON}>
            <Popup>
              <strong>Start:</strong> {source.name || source.shortName}
            </Popup>
          </Marker>
        )}

        {destination?.latitude && destination?.longitude && (
          <Marker position={[destination.latitude, destination.longitude]} icon={DEST_ICON}>
            <Popup>
              <strong>End:</strong> {destination.name || destination.shortName}
            </Popup>
          </Marker>
        )}

        {/* Traffic Impact Congested Zones */}
        {trafficZones.map((zone, i) => (
          <div key={`tz-${i}`}>
            <Circle
              center={zone.center}
              radius={zone.radius || 900}
              color="#ef4444"
              fillColor="#ef4444"
              fillOpacity={0.25}
              weight={2}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <span className="notion-pill notion-pill-red text-[10px] uppercase font-bold mb-1">
                    🚨 Traffic Impact Zone
                  </span>
                  <p className="font-bold text-sm mt-1">{zone.name}</p>
                  <p className="text-[11px] mt-1 opacity-90">{zone.description}</p>
                </div>
              </Popup>
            </Circle>
            <Marker position={zone.center} icon={CONGESTION_ZONE_ICON}>
              <Popup>
                <div className="p-1 text-xs">
                  <p className="font-bold text-xs">{zone.name}</p>
                  <p className="text-[11px] opacity-80">{zone.description}</p>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}

        {/* Safe Clear Detour Zones */}
        {safeZones.map((sz, i) => (
          <div key={`sz-${i}`}>
            <Circle
              center={sz.center}
              radius={sz.radius || 1200}
              color="#10b981"
              fillColor="#10b981"
              fillOpacity={0.2}
              weight={2}
              dashArray="4,4"
            >
              <Popup>
                <div className="p-1 text-xs">
                  <span className="notion-pill notion-pill-green text-[10px] uppercase font-bold mb-1">
                    🛡️ Safe Alternate Bypass
                  </span>
                  <p className="font-bold text-sm text-emerald-600 dark:text-emerald-300 mt-1">{sz.name}</p>
                  <p className="text-[11px] mt-1 opacity-80">{sz.description}</p>
                </div>
              </Popup>
            </Circle>
            <Marker position={sz.center} icon={SAFE_ZONE_ICON}>
              <Popup>
                <div className="p-1 text-xs">
                  <p className="font-bold text-xs">{sz.name}</p>
                  <p className="text-[11px] opacity-80">{sz.status}</p>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}

        {/* Incident Markers */}
        {incidents.map((inc) => (
          <Marker
            key={inc._id || inc.id}
            position={[inc.latitude, inc.longitude]}
            icon={INCIDENT_ICON_MAP[inc.type] || INCIDENT_ICON_MAP.other}
          >
            <Popup>
              <div className="text-xs">
                <strong>{INCIDENT_ICONS[inc.type]} {inc.title}</strong><br />
                <span>{inc.location}</span><br />
                <span>Severity: {inc.severity}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hotspot Circles */}
        {showHotspots && incidents.map((inc) => (
          <Circle
            key={`circle-${inc._id || inc.id}`}
            center={[inc.latitude, inc.longitude]}
            radius={800}
            color={inc.severity === 'high' || inc.severity === 'severe' ? '#ef4444' : '#f59e0b'}
            fillColor={inc.severity === 'high' || inc.severity === 'severe' ? '#ef4444' : '#f59e0b'}
            fillOpacity={0.15}
            weight={1}
          />
        ))}

        {boundsPositions.length >= 2 ? (
          <FitBounds boundsPositions={boundsPositions} triggerKey={triggerKey} />
        ) : (
          <PanToCenter center={initialCenter} zoom={zoom} />
        )}
      </MapContainer>
    </div>
  );
}
