import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lm_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — clear token and redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lm_token');
      localStorage.removeItem('lm_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// ── Properties ────────────────────────────────────────────
export const propertyAPI = {
  getAll: (params) => api.get('/properties', { params }),
  search: (params) => api.get('/properties/search', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  getMyProperties: () => api.get('/properties/my-properties'),
  create: (data) => api.post('/properties', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  verify: (id, status) => api.put(`/properties/${id}/verify`, { status }),
};

// ── Favorites ─────────────────────────────────────────────
export const favoriteAPI = {
  getAll: () => api.get('/favorites'),
  add: (propertyId) => api.post('/favorites', { propertyId }),
  remove: (propertyId) => api.delete(`/favorites/${propertyId}`),
};

// ── Reviews ───────────────────────────────────────────────
export const reviewAPI = {
  getByProperty: (propertyId) => api.get(`/reviews/${propertyId}`),
  create: (propertyId, data) => api.post(`/reviews/${propertyId}`, data),
};

// ── Messages ──────────────────────────────────────────────
export const messageAPI = {
  getAll: () => api.get('/messages'),
  send: (propertyId, content) => api.post(`/contact/${propertyId}`, { content }),
  reply: (messageId, content) => api.post(`/messages/reply/${messageId}`, { content }),
  markRead: () => api.put('/messages/read'),
};
// ── Admin ─────────────────────────────────────────────────
export const adminAPI = {
  getPending: () => api.get('/properties?status=pending&limit=100'),
  verify: (id, status) => api.put(`/properties/${id}/verify`, { status }),
};

export default api;
