import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor to add JWT token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const vehicleApi = {
  getAll: (params) => api.get('/vehicles', { params }),
  getOne: (id) => api.get(`/vehicles/${id}`),
  add: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const bookingApi = {
  calculate: (data) => api.post('/bookings/calculate', data),
  create: (data) => api.post('/bookings', data),
  getMy: () => api.get('/bookings/my'),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getPricingRules: () => api.get('/admin/pricing-rules'),
  addPricingRule: (data) => api.post('/admin/pricing-rules', data),
};

export default api;
