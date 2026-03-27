import axios from 'axios';

// Create an Axios instance pointing to the Flask backend
const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically attach JWT token if it exists
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export const api = {
  // ── Auth ──────────────────────────────────────────
  async login({ email, password }) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      // Save token to localStorage
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { user: response.data.user, token: response.data.access_token };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  },

  async register({ name, email, password, role }) {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { user: response.data.user, token: response.data.access_token };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Registration failed');
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // ── Vehicles ──────────────────────────────────────
  async getVehicles(filters = {}) {
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.fuel) params.fuel = filters.fuel.toLowerCase();
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      // Search is client-side filter or we send full if not supported on backend
      
      const response = await apiClient.get('/vehicles', { params });
      let vehicles = response.data.vehicles;

      if (filters.search) {
        const q = filters.search.toLowerCase();
        vehicles = vehicles.filter(v => v.model.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q));
      }
      return vehicles.map(v => ({
        ...v,
        name: `${v.brand} ${v.model}`,
        pricePerDay: v.price_per_day,
        pricePerHour: v.price_per_hour,
        image: v.photo_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        reviews: 120
      }));
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      return [];
    }
  },

  async getVehicleById(id) {
    try {
      const response = await apiClient.get(`/vehicles/${id}`);
      const v = response.data.vehicle;
      return {
        ...v,
        name: `${v.brand} ${v.model}`,
        pricePerDay: v.price_per_day,
        pricePerHour: v.price_per_hour,
        image: v.photo_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
      };
    } catch (err) {
      throw new Error('Vehicle not found');
    }
  },

  // ── Bookings ──────────────────────────────────────
  async createBooking(data) {
    // data has vehicleId, startDate, endDate
    try {
      const payload = {
        vehicle_id: data.vehicleId,
        start_date: new Date(data.startDate).toISOString(),
        end_date: new Date(data.endDate).toISOString()
      };
      const response = await apiClient.post('/bookings', payload);
      const b = response.data.booking;
      return { ...b, id: b.id, vehicleId: b.vehicle_id, status: b.status, totalPrice: b.total_cost, startDate: b.start_date, endDate: b.end_date };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create booking');
    }
  },

  async getBookings() {
    try {
      const response = await apiClient.get('/bookings');
      return response.data.bookings.map(b => ({
        id: b.id,
        vehicleId: b.vehicle_id,
        status: b.status,
        totalPrice: b.total_cost,
        startDate: b.start_date,
        endDate: b.end_date,
        createdAt: b.created_at
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  // ── Payments ──────────────────────────────────────
  async processPayment({ bookingId, method, amount }) {
    try {
      const payload = {
        booking_id: bookingId,
        mode: method
      };
      const response = await apiClient.post('/payments', payload);
      return { success: true, transactionId: 'TXN_' + Date.now(), ...response.data.receipt };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Payment failed');
    }
  },
};
