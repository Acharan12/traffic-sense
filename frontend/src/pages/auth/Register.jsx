import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const passwordRules = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
];

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched(true);

    if (!form.name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }

    const failedRules = passwordRules.filter((r) => !r.test(form.password));
    if (failedRules.length > 0) {
      setError(`Password must meet all requirements: ${failedRules.map((r) => r.label).join(', ')}.`);
      return;
    }

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    const result = await register(form.name.trim(), form.email.trim(), form.password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message || 'Registration failed. Please try again.');
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
            Create Your Account
          </h1>
          <p className="text-xs text-notion-muted">
            Start optimizing routes with AI-powered telemetry
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
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="text-[11px] text-notion-dim block mb-1">Full Name</label>
              <div className="relative">
                <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-notion-dim pointer-events-none" />
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Alex Morgan"
                  required
                  autoComplete="name"
                  className="notion-input pl-7"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="text-[11px] text-notion-dim block mb-1">Email Address</label>
              <div className="relative">
                <Mail size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-notion-dim pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="notion-input pl-7"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="text-[11px] text-notion-dim block mb-1">Password</label>
              <div className="relative">
                <Lock size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-notion-dim pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={(e) => { handleChange(e); setTouched(true); }}
                  placeholder="Min 8 characters"
                  required
                  autoComplete="new-password"
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

              {/* Password strength checklist */}
              {touched && form.password && (
                <ul className="mt-2 space-y-1">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(form.password);
                    return (
                      <li key={rule.label} className={`flex items-center gap-1.5 text-[10px] ${passed ? 'text-green-600 dark:text-green-400' : 'text-notion-dim'}`}>
                        <CheckCircle2 size={10} className={passed ? 'text-green-500' : 'text-notion-border'} />
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="text-[11px] text-notion-dim block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-notion-dim pointer-events-none" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                  autoComplete="new-password"
                  className="notion-input pl-7 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-notion-dim hover:text-notion-text transition-colors"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-notion-primary w-full justify-center py-2 text-xs font-semibold mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Creating account...
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
