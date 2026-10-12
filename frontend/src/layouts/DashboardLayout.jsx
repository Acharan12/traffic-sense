import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Menu, X, Search, ChevronRight, LogOut, Sun, Moon,
  Layers, Sparkles, ExternalLink
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '🚦' },
  { path: '/route-planner', label: 'Route Optimizer', icon: '📍' },
  { path: '/traffic-map', label: 'Live Traffic Map', icon: '🗺️' },
  { path: '/news', label: 'News & OCR Checker', icon: '📰' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/predict', label: 'AI Predictor', icon: '🧠' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentPage =
    NAV_ITEMS.find((n) => n.path === location.pathname) ||
    (location.pathname === '/admin' ? { label: 'Admin Database', icon: '⚡️' } : { label: 'Workspace', icon: '📄' });

  return (
    <div className="flex h-screen bg-notion-bg text-notion-text font-sans overflow-hidden transition-colors duration-150">
      {/* Notion Minimal Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-60' : 'w-0 -translate-x-full'
        } lg:w-60 lg:translate-x-0 transition-all duration-150 flex-shrink-0 bg-notion-sidebar border-r border-notion-border flex flex-col z-30 select-none`}
      >
        {/* Workspace Brand Block */}
        <div className="p-3 border-b border-notion-border flex items-center justify-between">
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-lg">🚦</span>
            <div>
              <p className="text-xs font-bold text-notion-heading tracking-tight font-serif">TrafficSense</p>
              <p className="text-[10px] text-notion-dim font-mono">Workspace v2.1</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-notion-dim hover:text-notion-text p-1"
          >
            <X size={14} />
          </button>
        </div>

        {/* Quick Search Item */}
        <div className="px-2 pt-2 pb-1">
          <div
            onClick={() => navigate('/route-planner')}
            className="flex items-center justify-between px-2.5 py-1.5 rounded bg-notion-card border border-notion-border text-notion-dim text-xs cursor-pointer hover:text-notion-text hover:border-notion-subtle transition-all"
          >
            <div className="flex items-center gap-2">
              <Search size={12} />
              <span>Search routes...</span>
            </div>
            <kbd className="text-[10px] font-mono bg-notion-sidebar px-1 rounded border border-notion-border">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          <p className="text-[10px] font-semibold text-notion-dim px-2 pt-2 pb-1 uppercase tracking-wider">
            Workspace
          </p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `notion-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="text-sm">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <p className="text-[10px] font-semibold text-notion-dim px-2 pt-3 pb-1 uppercase tracking-wider">
                Management
              </p>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `notion-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="text-sm">⚡️</span>
                <span>Admin Database</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Sidebar Footer: Theme Toggle & User Account */}
        <div className="p-2 border-t border-notion-border space-y-1">
          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-notion-hover text-xs text-notion-muted hover:text-notion-text transition-colors"
          >
            <div className="flex items-center gap-2">
              {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-600" />}
              <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
            </div>
            <span className="notion-pill notion-pill-gray text-[9px]">
              {isDark ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* User Row or Sign In Button */}
          {user ? (
            <div className="flex items-center justify-between p-1.5 rounded hover:bg-notion-hover transition-colors text-xs">
              <div
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
              >
                <div className="w-6 h-6 rounded bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="truncate">
                  <p className="font-medium text-notion-heading truncate text-[11px]">{user.name}</p>
                  <p className="text-[10px] text-notion-dim truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="text-notion-dim hover:text-notion-text p-1 ml-1"
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="btn-notion-primary w-full justify-center py-1.5 text-xs font-semibold"
            >
              Sign In
            </button>
          )}
        </div>
      </aside>

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Minimal Breadcrumbs Bar */}
        <header className="h-11 bg-notion-bg border-b border-notion-border flex items-center justify-between px-4 z-10 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded text-notion-dim hover:text-notion-text hover:bg-notion-hover transition-colors"
              title="Toggle sidebar"
            >
              <Menu size={14} />
            </button>
            <span className="text-notion-dim">TrafficSense</span>
            <ChevronRight size={11} className="text-notion-dim" />
            <span className="flex items-center gap-1.5 font-medium text-notion-heading">
              <span>{currentPage.icon}</span>
              <span>{currentPage.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Header Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-notion-ghost text-xs py-1 px-2 flex items-center gap-1.5"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
              <span className="hidden sm:inline text-[11px]">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={() => navigate('/route-planner')}
              className="btn-notion-primary text-xs py-1 px-2.5"
            >
              Plan Route
            </button>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
