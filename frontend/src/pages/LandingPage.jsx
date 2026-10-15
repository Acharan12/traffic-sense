import { useNavigate } from 'react-router-dom';
import {
  Navigation, Shield, Sparkles, MapPin, ArrowRight,
  TrendingUp, Newspaper, CheckCircle2, ChevronRight, FileText, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { RoadDoodle, CityDoodle, AiDoodle, DocumentDoodle } from '../components/ui/NotionDoodles';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const FEATURES = [
    {
      icon: '📍',
      title: 'OSRM Route Optimizer',
      desc: 'Real turn-by-turn road curves with turn penalties, detour generation, and travel time scoring.',
    },
    {
      icon: '📰',
      title: 'News & OCR Fact-Checker',
      desc: 'Tesseract.js OCR image parsing with AI credibility scoring to classify Real vs. Fake reports.',
    },
    {
      icon: '🧠',
      title: 'Random Forest AI Predictor',
      desc: 'Trained ML model predicting congestion severity with weather, hour, and road-type inputs.',
    },
    {
      icon: '🗺️',
      title: 'Live Traffic & Hazard Database',
      desc: 'Real-world incident tracker with automatic traffic impact and safe bypass corridor mapping.',
    },
  ];

  return (
    <div className="min-h-screen bg-notion-bg text-notion-text font-sans selection:bg-neutral-300 dark:selection:bg-neutral-700 transition-colors duration-150">
      {/* Top Navbar */}
      <header className="border-b border-notion-border bg-notion-bg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🚦</span>
            <span className="font-bold text-notion-heading font-serif tracking-tight text-sm">
              TrafficSense
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn-notion-ghost text-xs py-1 px-2 flex items-center gap-1.5"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
              <span className="text-[11px]">{isDark ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-notion-ghost text-xs py-1"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-notion-primary text-xs py-1 px-3"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Notion Document Hero */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Cover Block with Minimal Theme-Adaptive Doodle */}
        <div className="border border-notion-border rounded-lg bg-notion-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-3 max-w-md">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-notion-sidebar border border-notion-border text-[11px] text-notion-muted">
              <span>●</span> Minimal AI Traffic Intelligence Workspace
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-notion-heading font-serif tracking-tight leading-tight">
              Predict traffic. Verify incidents. Navigate safe detours.
            </h1>
            <p className="text-xs text-notion-muted leading-relaxed">
              A distraction-free platform combining real OSRM road geometry, Random Forest machine learning, OCR fact-checking, and interactive safe corridor routing.
            </p>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="btn-notion-primary py-2 px-4 text-xs font-semibold"
              >
                <span>Get Started</span>
                <ArrowRight size={12} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-notion-secondary py-2 px-3 text-xs"
              >
                Sign In
              </button>
            </div>
          </div>

          <RoadDoodle className="w-40 h-40 flex-shrink-0" />
        </div>

        {/* Feature Database Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-notion-border pb-2">
            <h2 className="text-xs font-semibold text-notion-dim uppercase tracking-wider">
              Workspace Capabilities
            </h2>
            <span className="text-[11px] text-notion-dim font-mono">4 core modules</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                onClick={() => navigate('/login')}
                className="notion-card p-4 space-y-2 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{f.icon}</span>
                  <ChevronRight size={14} className="text-notion-dim group-hover:text-notion-heading transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-notion-heading font-serif">{f.title}</h3>
                <p className="text-xs text-notion-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Spec Footer */}
        <div className="border-t border-notion-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-notion-dim">
          <p>© 2026 TrafficSense · Clean Minimalist Traffic Intelligence</p>
          <div className="flex items-center gap-4">
            <span>OSRM Road Graphs</span>
            <span>·</span>
            <span>Tesseract.js OCR</span>
            <span>·</span>
            <span>Scikit-Learn ML</span>
          </div>
        </div>
      </main>
    </div>
  );
}
