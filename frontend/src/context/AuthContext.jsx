import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until initial token check completes

  /**
   * On mount: validate stored token by hitting /auth/me.
   * If the token is expired or invalid the 401 interceptor in API client
   * will clear localStorage and redirect to /login automatically.
   */
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('ts_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await API.get('/auth/me');
        if (data?.data) {
          setUser(data.data);
          localStorage.setItem('ts_user', JSON.stringify(data.data));
        } else {
          // Unexpected response — treat as unauthenticated
          _clearSession();
        }
      } catch {
        // 401 handled by axios interceptor; other errors: clear session defensively
        _clearSession();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const _clearSession = () => {
    localStorage.removeItem('ts_token');
    localStorage.removeItem('ts_user');
    setUser(null);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('ts_token', data.token);
      localStorage.setItem('ts_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      localStorage.setItem('ts_token', data.token);
      localStorage.setItem('ts_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    _clearSession();
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      if (data?.data) {
        setUser(data.data);
        localStorage.setItem('ts_user', JSON.stringify(data.data));
      }
    } catch {
      // If refresh fails due to expired token, interceptor handles redirect
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
