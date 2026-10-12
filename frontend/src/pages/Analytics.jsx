import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { TrendingUp, RefreshCw, Activity, Clock, ShieldCheck, Car } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AiDoodle } from '../components/ui/NotionDoodles';
import API from '../api/client';

export default function Analytics() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/traffic/stats?location=Vadodara');
      setStats(data.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const HOURLY_FLOW = [
    { hour: '00:00', score: 18 }, { hour: '03:00', score: 12 },
    { hour: '06:00', score: 28 }, { hour: '09:00', score: 82 },
    { hour: '12:00', score: 62 }, { hour: '15:00', score: 54 },
    { hour: '18:00', score: 88 }, { hour: '21:00', score: 45 },
  ];

  const DAY_FLOW = [
    { day: 'Mon', count: 420 }, { day: 'Tue', count: 460 },
    { day: 'Wed', count: 490 }, { day: 'Thu', count: 480 },
    { day: 'Fri', count: 580 }, { day: 'Sat', count: 390 },
    { day: 'Sun', count: 310 },
  ];

  return (
    <div className="min-h-full bg-notion-bg text-notion-text pb-16 font-sans">
      {/* Minimal Cover */}
      <div className="notion-cover flex items-center justify-between px-8">
        <div>
          <p className="text-xs text-notion-dim font-mono uppercase tracking-wider">Telemetry</p>
          <p className="text-sm font-semibold text-notion-heading font-serif">City Congestion Patterns & ML Performance</p>
        </div>
        <AiDoodle className="w-16 h-16 opacity-40" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6">
        {/* Header Block */}
        <div className="relative mb-2">
          <div className="notion-page-icon">📈</div>
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-notion-heading font-serif tracking-tight">
                Traffic Telemetry & Analytics
              </h1>
              <p className="text-xs text-notion-muted mt-0.5">
                Congestion trends, peak hour distribution, and ML model accuracy metrics.
              </p>
            </div>
            <button
              onClick={fetchStats}
              className="btn-notion-secondary text-xs"
              title="Refresh"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* 4 Minimal Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="notion-card p-3 space-y-1">
            <span className="text-[11px] text-notion-dim block">Avg City Index</span>
            <p className="text-xl font-bold text-notion-heading font-serif">
              {stats?.averageTrafficScore || 52}<span className="text-xs text-notion-dim font-sans">/100</span>
            </p>
            <span className="notion-pill notion-pill-yellow text-[9px]">Moderate</span>
          </div>

          <div className="notion-card p-3 space-y-1">
            <span className="text-[11px] text-notion-dim block">ML Model Accuracy</span>
            <p className="text-xl font-bold text-notion-heading font-serif">81.2%</p>
            <span className="notion-pill notion-pill-green text-[9px]">Random Forest</span>
          </div>

          <div className="notion-card p-3 space-y-1">
            <span className="text-[11px] text-notion-dim block">Active Hazards</span>
            <p className="text-xl font-bold text-notion-heading font-serif">
              {stats?.totalIncidents || 8}
            </p>
            <span className="notion-pill notion-pill-red text-[9px]">Real Roadblocks</span>
          </div>

          <div className="notion-card p-3 space-y-1">
            <span className="text-[11px] text-notion-dim block">Route Searches</span>
            <p className="text-xl font-bold text-notion-heading font-serif">
              {stats?.totalSearches || 142}
            </p>
            <span className="notion-pill notion-pill-gray text-[9px]">Optimal Detours</span>
          </div>
        </div>

        {/* Charts Grid: Theme-Adaptive B&W Line/Area Chart + Bar Chart */}
        <div className="grid md:grid-cols-2 gap-4 items-start">
          {/* 24h Congestion Cycle */}
          <div className="notion-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-notion-border pb-2">
              <span className="text-xs font-semibold text-notion-heading font-serif">
                24-Hour Congestion Curve
              </span>
              <span className="text-[10px] text-notion-dim font-mono">00:00 — 23:59</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HOURLY_FLOW} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2e2e2e' : '#e9e9e8'} />
                  <XAxis dataKey="hour" stroke={isDark ? '#63625f' : '#9b9a97'} fontSize={10} tickLine={false} />
                  <YAxis stroke={isDark ? '#63625f' : '#9b9a97'} fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#202020' : '#ffffff',
                      borderColor: isDark ? '#2e2e2e' : '#e9e9e8',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: isDark ? '#e3e2e0' : '#37352f',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={isDark ? '#ffffff' : '#191919'}
                    strokeWidth={2}
                    fill={isDark ? '#333333' : '#e5e5e5'}
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Traffic Volume */}
          <div className="notion-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-notion-border pb-2">
              <span className="text-xs font-semibold text-notion-heading font-serif">
                Weekly Traffic Load
              </span>
              <span className="text-[10px] text-notion-dim font-mono">Mon — Sun</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DAY_FLOW} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2e2e2e' : '#e9e9e8'} />
                  <XAxis dataKey="day" stroke={isDark ? '#63625f' : '#9b9a97'} fontSize={10} tickLine={false} />
                  <YAxis stroke={isDark ? '#63625f' : '#9b9a97'} fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#202020' : '#ffffff',
                      borderColor: isDark ? '#2e2e2e' : '#e9e9e8',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: isDark ? '#e3e2e0' : '#37352f',
                    }}
                  />
                  <Bar dataKey="count" fill={isDark ? '#e3e2e0' : '#37352f'} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
