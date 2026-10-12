import { getWeatherIcon } from '../../utils';
import { Droplets, Wind, Eye } from 'lucide-react';

export default function WeatherWidget({ weather, compact = false }) {
  if (!weather) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 text-xs text-notion-text">
        <span className="text-xl">{getWeatherIcon(weather.condition)}</span>
        <div>
          <p className="font-semibold">{weather.temperature}°C</p>
          <p className="text-notion-dim text-[11px] capitalize">{weather.condition}</p>
        </div>
        {weather.rainfall > 0 && (
          <span className="notion-pill notion-pill-blue text-[10px] ml-auto">
            {weather.rainfall}mm
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="notion-card p-4 space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-notion-dim uppercase tracking-wider">
          Weather Conditions
        </span>
        <span className="notion-pill notion-pill-gray text-[11px]">{weather.city}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-4xl">{getWeatherIcon(weather.condition)}</span>
        <div>
          <h4 className="text-2xl font-bold text-notion-text font-serif">
            {weather.temperature}°C
          </h4>
          <p className="text-xs text-notion-muted capitalize">{weather.condition}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-notion-border text-center text-xs">
        <div className="p-1.5 rounded-notion bg-notion-sidebar">
          <Droplets size={12} className="text-blue-400 mx-auto mb-0.5" />
          <p className="font-medium text-notion-text">{weather.rainfall || 0} mm</p>
          <p className="text-[10px] text-notion-dim">Rain</p>
        </div>
        <div className="p-1.5 rounded-notion bg-notion-sidebar">
          <Wind size={12} className="text-teal-400 mx-auto mb-0.5" />
          <p className="font-medium text-notion-text">{weather.windSpeed} km/h</p>
          <p className="text-[10px] text-notion-dim">Wind</p>
        </div>
        <div className="p-1.5 rounded-notion bg-notion-sidebar">
          <Eye size={12} className="text-indigo-400 mx-auto mb-0.5" />
          <p className="font-medium text-notion-text">{Math.round(weather.visibility / 1000)} km</p>
          <p className="text-[10px] text-notion-dim">Visibility</p>
        </div>
      </div>
    </div>
  );
}
