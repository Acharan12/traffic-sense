import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }

    const result = await login(form.email.trim(), form.password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-notion-bg flex items-center justify-center p-4 font-sans text-notion-text transition-colors">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
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

        {/* Card */}
        <div className="notion-card p-6 space-y-4 shadow-sm">
          {error && (
            <div className="notion-callout-red text-xs">
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="text-[11px] text-notion-dim block mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-notion-dim pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="notion-input pl-7"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="text-[11px] text-notion-dim block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-notion-dim pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="notion-input pl-7 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-notion-dim hover:text-notion-text transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-notion-primary w-full justify-center py-2 text-xs font-semibold mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Signing in...
                </>
              ) : (
                'Sign In'
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

        <p className="text-center text-[11px] text-notion-dim">
          By signing in, you agree to keep your credentials secure and not share them with others.
        </p>
      </div>
    </div>
  );
}
