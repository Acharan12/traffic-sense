import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, History, MapPin, Clock, LogOut } from 'lucide-react';
import { DocumentDoodle } from '../components/ui/NotionDoodles';
import API from '../api/client';

export default function Profile() {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/routes/history');
      setHistory(data?.data || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-full bg-notion-bg text-notion-text pb-16 font-sans">
      {/* Minimal Cover */}
      <div className="notion-cover flex items-center justify-between px-8">
        <div>
          <p className="text-xs text-notion-dim font-mono uppercase tracking-wider">Account</p>
          <p className="text-sm font-semibold text-notion-heading font-serif">Workspace Preferences & History</p>
        </div>
        <DocumentDoodle className="w-16 h-16 opacity-40" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-6">
        {/* Header Block */}
        <div className="relative mb-2">
          <div className="notion-page-icon">👤</div>
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-notion-heading font-serif tracking-tight">
                {user.name}
              </h1>
              <p className="text-xs text-notion-muted mt-0.5">{user.email}</p>
            </div>
            <button onClick={logout} className="btn-notion-secondary text-xs">
              <LogOut size={12} />
              <span>Sign out</span>
            </button>
          </div>

          {/* Properties Row */}
          <div className="flex items-center gap-4 pt-3 mt-3 border-t border-notion-border text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-notion-dim">Role:</span>
              <span className="notion-pill notion-pill-gray text-[10px] capitalize">
                {user.role || 'User'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-notion-dim">Status:</span>
              <span className="notion-pill notion-pill-green text-[10px]">Active</span>
            </div>
          </div>
        </div>

        {/* Search History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-notion-border pb-2">
            <span className="text-xs font-semibold text-notion-dim uppercase tracking-wider flex items-center gap-1.5">
              <History size={12} />
              Recent Route Searches ({history.length})
            </span>
          </div>

          {loading ? (
            <div className="notion-card p-6 text-center text-xs text-notion-dim">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="notion-card p-8 text-center text-xs text-notion-dim space-y-1">
              <p>No search history recorded yet.</p>
              <p className="text-[11px] opacity-70">
                Routes calculated in Route Planner will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="notion-card overflow-hidden">
              <div className="grid grid-cols-4 p-2 bg-notion-sidebar border-b border-notion-border text-[11px] font-mono text-notion-dim">
                <span>Origin</span>
                <span>Destination</span>
                <span>Mode</span>
                <span>Timestamp</span>
              </div>
              {history.map((h, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 p-3 notion-table-row items-center text-xs"
                >
                  <span className="truncate font-medium text-notion-heading">
                    {h.source?.name || h.source}
                  </span>
                  <span className="truncate text-notion-text">
                    {h.destination?.name || h.destination}
                  </span>
                  <span className="capitalize text-notion-dim">
                    {h.travelMode || 'driving'}
                  </span>
                  <span className="text-[11px] text-notion-dim">
                    {new Date(h.createdAt || h.searchedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
