import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import RoutePlanner from './pages/RoutePlanner';
import TrafficMap from './pages/TrafficMap';
import NewsIntelligence from './pages/NewsIntelligence';
import Analytics from './pages/Analytics';
import PredictionPage from './pages/PredictionPage';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

/**
 * ProtectedRoute — blocks access to any route unless the user is authenticated.
 * Shows a loading spinner while the session is being verified on mount.
 * If not authenticated, redirects to /login preserving the intended destination.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-notion-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl animate-pulse">🚦</span>
          <p className="text-xs text-notion-dim font-mono">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * AdminRoute — additionally requires the admin role.
 */
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-notion-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl animate-pulse">🚦</span>
          <p className="text-xs text-notion-dim font-mono">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

/**
 * PublicOnlyRoute — if the user is already logged in, redirect them to
 * the dashboard so they don't see the login/register pages.
 */
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-notion-bg flex items-center justify-center">
        <span className="text-3xl animate-pulse">🚦</span>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing page — public, no auth required */}
            <Route path="/" element={<LandingPage />} />

            {/* Public auth pages — redirect to dashboard if already logged in */}
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

            {/* All application routes — strictly protected, wrapped in DashboardLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/route-planner" element={<RoutePlanner />} />
              <Route path="/traffic-map" element={<TrafficMap />} />
              <Route path="/news" element={<NewsIntelligence />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/predict" element={<PredictionPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
            </Route>

            {/* Catch-all — redirect unknown paths to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
