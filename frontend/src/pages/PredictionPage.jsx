import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, Sliders, RefreshCw } from 'lucide-react';
import { AiDoodle } from '../components/ui/NotionDoodles';
import API from '../api/client';

export default function PredictionPage() {
  const [form, setForm] = useState({
    hour: 9,
    day_of_week: 1,
    weather_condition: 'Clear',
    temperature: 32,
    rainfall: 0,
    average_speed: 35,
    vehicle_count: 750,
    accident: 0,
    construction: 0,
    event: 0,
    road_type: 'urban',
    route_length: 12,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const PRESETS = [
    { label: 'Rush Hour (9 AM)', values: { hour: 9, day_of_week: 1, vehicle_count: 950, accident: 0 } },
    { label: 'Rainy Monsoon', values: { weather_condition: 'Rainy', rainfall: 25, average_speed: 20 } },
    { label: 'Accident Disruption', values: { accident: 1, vehicle_count: 850, average_speed: 15 } },
    { label: 'Night Highway', values: { hour: 23, day_of_week: 6, vehicle_count: 200, average_speed: 65, road_type: 'highway' } },
  ];

  const handlePredict = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/predictions/predict', form);
      setPrediction(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    const updated = { ...form, ...preset.values };
    setForm(updated);
  };

  return (
    <div className="min-h-full bg-notion-bg text-notion-text pb-16 font-sans">
      {/* Minimal Cover */}
      <div className="notion-cover flex items-center justify-between px-8">
        <div>
          <p className="text-xs text-notion-dim font-mono uppercase tracking-wider">ML Sandbox</p>
          <p className="text-sm font-semibold text-notion-heading font-serif">Random Forest Traffic Forecaster</p>
        </div>
        <AiDoodle className="w-16 h-16 opacity-40" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-6">
        {/* Header Block */}
        <div className="relative mb-2">
          <div className="notion-page-icon">🧠</div>
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-notion-heading font-serif tracking-tight">
                AI Traffic Predictor
              </h1>
              <p className="text-xs text-notion-muted mt-0.5">
                Simulate weather conditions, peak hours, and road incidents to forecast congestion severity.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-notion-border flex-wrap text-xs">
            <span className="text-notion-dim mr-1">Presets:</span>
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => applyPreset(p)}
                className="btn-notion-secondary text-xs py-1 px-2.5"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simulator Grid */}
        <div className="grid md:grid-cols-2 gap-4 items-start">
          {/* Left Form: Clean minimal parameters */}
          <div className="notion-card p-4 space-y-3">
            <span className="text-xs font-semibold text-notion-heading font-serif block border-b border-notion-border pb-2">
              Input Parameters
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-notion-dim block mb-1">Time (Hour 0-23)</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={form.hour}
                  onChange={(e) => setForm({ ...form, hour: parseInt(e.target.value) || 0 })}
                  className="notion-input"
                />
              </div>
              <div>
                <label className="text-[11px] text-notion-dim block mb-1">Weather</label>
                <select
                  value={form.weather_condition}
                  onChange={(e) => setForm({ ...form, weather_condition: e.target.value })}
                  className="notion-input"
                >
                  <option value="Clear">Clear</option>
                  <option value="Rainy">Rainy</option>
                  <option value="Foggy">Foggy</option>
                  <option value="Cloudy">Cloudy</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-notion-dim block mb-1">Active Accident</label>
                <select
                  value={form.accident}
                  onChange={(e) => setForm({ ...form, accident: parseInt(e.target.value) })}
                  className="notion-input"
                >
                  <option value={0}>No</option>
                  <option value={1}>Yes (Active Crash)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-notion-dim block mb-1">Road Type</label>
                <select
                  value={form.road_type}
                  onChange={(e) => setForm({ ...form, road_type: e.target.value })}
                  className="notion-input"
                >
                  <option value="urban">Urban Arterial</option>
                  <option value="highway">Express Highway</option>
                  <option value="residential">Residential</option>
                </select>
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className="btn-notion-primary w-full justify-center py-2 text-xs font-semibold mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Simulating...
                </>
              ) : (
                'Run ML Prediction'
              )}
            </button>
          </div>

          {/* Right Panel: Clean Output Callout */}
          <div className="notion-card p-4 space-y-3">
            <span className="text-xs font-semibold text-notion-heading font-serif block border-b border-notion-border pb-2">
              Forecast Result
            </span>

            {prediction ? (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between p-3 rounded bg-notion-sidebar border border-notion-border">
                  <div>
                    <span className="text-[10px] text-notion-dim uppercase block">Congestion Level</span>
                    <p className="text-lg font-bold text-notion-heading font-serif mt-0.5 capitalize">
                      {prediction.trafficLevel}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-notion-dim uppercase block">Traffic Score</span>
                    <p className="text-lg font-bold text-notion-heading font-mono mt-0.5">
                      {prediction.trafficScore}/100
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-notion-sidebar border border-notion-border space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-notion-dim">Model Confidence:</span>
                    <span className="font-mono text-notion-heading font-semibold">
                      {Math.round((prediction.confidence || 0.85) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-notion-dim">Model Algorithm:</span>
                    <span className="text-notion-text">RandomForestClassifier</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-notion-dim space-y-1">
                <p className="text-xl">📊</p>
                <p>Click "Run ML Prediction" to generate congestion forecast.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
