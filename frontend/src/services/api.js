import axios from 'axios';

// Ensure consistent guest session ID
let sessionId = localStorage.getItem('mn_session_id');
if (!sessionId) {
  sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
  localStorage.setItem('mn_session_id', sessionId);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Session-Id': sessionId
  }
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const currentPath = window.location.pathname;
      if (
        url.includes('/auth/me') ||
        currentPath.startsWith('/account') ||
        currentPath.startsWith('/admin') ||
        currentPath.startsWith('/checkout')
      ) {
        localStorage.removeItem('mn_token');
        localStorage.removeItem('mn_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
