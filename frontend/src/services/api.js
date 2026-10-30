import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all outgoing requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studypilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized on protected routes
    if (error.response && error.response.status === 401) {
      const isAuthRequest =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('studypilot_token');
        localStorage.removeItem('studypilot_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Subject Services
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Dashboard Services
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// User Profile Services
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export default api;
