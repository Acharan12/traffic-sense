import { Clock, MapPin, Shield, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import TrafficScoreBadge from './TrafficScoreBadge';

const ROUTE_COLORS = [
  { border: 'border-blue-500', dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  { border: 'border-purple-600', dot: 'bg-purple-600', text: 'text-purple-600 dark:text-purple-400' },
  { border: 'border-orange-500', dot: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
  { border: 'border-cyan-500', dot: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400' },
  { border: 'border-pink-500', dot: 'bg-pink-500', text: 'text-pink-600 dark:text-pink-400' },
  { border: 'border-emerald-600', dot: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400' },
];

export default function RouteCard({ route, rank = 0, isSelected, onSelect }) {
  const isRecommended = route.isRecommended;
  const colorTheme = ROUTE_COLORS[rank % ROUTE_COLORS.length];

  return (
    <div
      onClick={() => onSelect(route)}
      className={`notion-card cursor-pointer transition-all duration-200 p-3.5 space-y-2.5 rounded-lg border-2 ${
        isSelected
          ? 'border-neutral-900 dark:border-white shadow-xl scale-[1.02] bg-white dark:bg-neutral-800'
          : 'border-notion-border hover:border-neutral-400 dark:hover:border-neutral-600 bg-notion-card'
      }`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${
              isSelected
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent'
                : 'bg-notion-sidebar text-notion-heading border-notion-border'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${colorTheme.dot}`} />
            {route.routeTag || route.name.split('(')[0].trim()}
          </span>

          {isRecommended && (
            <span className="notion-pill notion-pill-green text-[10px] font-bold">
              ⭐️ Recommended Route
            </span>
          )}

          {route.hasAccidentOnRoute && (
            <span className="notion-pill notion-pill-red text-[10px] font-bold">
              ⚠️ Hazard on Path
            </span>
          )}
        </div>

        <TrafficScoreBadge score={route.trafficScore} level={route.trafficLevel} />
      </div>

      {/* Route Subtitle */}
      <p className="text-xs font-semibold text-notion-heading">
        {route.name}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-notion-border text-xs">
        <div>
          <span className="text-[10px] text-notion-dim block font-medium">Duration</span>
          <span className="font-bold text-notion-heading text-sm">{route.duration} min</span>
        </div>
        <div>
          <span className="text-[10px] text-notion-dim block font-medium">Distance</span>
          <span className="font-bold text-notion-heading text-sm">{route.distance} km</span>
        </div>
        <div>
          <span className="text-[10px] text-notion-dim block font-medium">Risk Level</span>
          <span
            className={`font-bold text-xs capitalize ${
              route.riskLevel === 'High'
                ? 'text-red-600 dark:text-red-400'
                : route.riskLevel === 'Moderate'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {route.riskLevel}
          </span>
        </div>
      </div>

      {/* Explanation Callout */}
      {route.explanation && (
        <div
          className={`p-2 rounded text-[11px] leading-relaxed border ${
            isRecommended
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : route.hasAccidentOnRoute
              ? 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300'
              : 'bg-notion-sidebar border-notion-border text-notion-muted'
          }`}
        >
          {route.explanation}
        </div>
      )}
    </div>
  );
}
