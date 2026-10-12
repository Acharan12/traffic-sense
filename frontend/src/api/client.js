import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const API = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ts_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ts_token');
      localStorage.removeItem('ts_user');
    }
    return Promise.reject(err);
  }
);

export default API;
