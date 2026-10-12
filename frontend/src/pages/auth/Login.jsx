import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle, Sparkles, Shield, User } from 'lucide-react';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid email or password');
    }
  };

  const fillAndSubmit = async (email, password) => {
    setForm({ email, password });
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-notion-bg flex items-center justify-center p-4 font-sans text-notion-text transition-colors">
      <div className="w-full max-w-sm space-y-6">
        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-notion-card border border-notion-border flex items-center justify-center text-2xl shadow-sm mx-auto select-none">
            🚦
          </div>
          <h1 className="text-xl font-bold text-notion-heading font-serif tracking-tight">
            Sign in to TrafficSense
          </h1>
          <p className="text-xs text-notion-muted">
            Access your routes, telemetry, and live traffic workspace
          </p>
        </div>

        {/* Card Box */}
        <div className="notion-card p-6 space-y-4 shadow-sm">
          {error && (
            <div className="notion-callout-red text-xs">
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Fill Badges */}
          <div className="space-y-1.5 pb-2 border-b border-notion-border">
            <span className="text-[10px] text-notion-dim font-mono uppercase tracking-wider block">
              1-Click Quick Login:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillAndSubmit('admin@trafficsense.com', 'Admin@123')}
                className="btn-notion-secondary py-1.5 px-2 text-xs flex items-center justify-center gap-1.5 font-semibold"
              >
                <Shield size={12} className="text-purple-500" />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                onClick={() => fillAndSubmit('demo@trafficsense.com', 'User@123')}
                className="btn-notion-secondary py-1.5 px-2 text-xs flex items-center justify-center gap-1.5 font-semibold"
              >
                <User size={12} className="text-blue-500" />
                <span>Demo User</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-notion-dim block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@trafficsense.com"
                required
                className="notion-input"
              />
            </div>
            <div>
              <label className="text-[11px] text-notion-dim block mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="notion-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-notion-primary w-full justify-center py-2 text-xs font-semibold mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Signing in...
                </>
              ) : (
                'Continue with Email'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-notion-dim pt-2 border-t border-notion-border">
            New to TrafficSense?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
