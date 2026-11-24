import axios from 'axios';

// Ensure consistent guest session ID
let sessionId = localStorage.getItem('mn_session_id');
if (!sessionId) {
  sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
  localStorage.setItem('mn_session_id', sessionId);
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Session-Id': sessionId
  }
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mn_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/account') || currentPath.startsWith('/admin')) {
        localStorage.removeItem('mn_token');
        localStorage.removeItem('mn_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
