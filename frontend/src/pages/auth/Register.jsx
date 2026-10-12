import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
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
            Create TrafficSense Workspace
          </h1>
          <p className="text-xs text-notion-muted">
            Start optimizing routes with AI-powered telemetry
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

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-notion-dim block mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Morgan"
                required
                className="notion-input"
              />
            </div>
            <div>
              <label className="text-[11px] text-notion-dim block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
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
                placeholder="Minimum 6 characters"
                required
                className="notion-input"
              />
            </div>
            <div>
              <label className="text-[11px] text-notion-dim block mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat password"
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
                  <Loader2 size={13} className="animate-spin" /> Creating workspace...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-notion-dim pt-2 border-t border-notion-border">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
