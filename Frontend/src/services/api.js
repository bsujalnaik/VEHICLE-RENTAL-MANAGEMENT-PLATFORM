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
  async login({ email, password, role }) {
    try {
      const response = await apiClient.post('/auth/login', { email, password, role });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { user: response.data.user, token: response.data.access_token };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  },

  async register({ name, email, password, role, licenseFile }) {
    try {
      let payload = { name, email, password, role };
      let headers = {};

      if (role === 'admin' && licenseFile) {
        payload = new FormData();
        payload.append('name', name);
        payload.append('email', email);
        payload.append('password', password);
        payload.append('role', role);
        payload.append('license', licenseFile);
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      const response = await apiClient.post('/auth/register', payload, { headers });
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
      if (filters.status) params.status = filters.status;

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

  async createVehicle(data) {
    try {
      const payload = {
        brand: data.brand,
        model: data.model || data.name,
        type: data.type,
        fuel: data.fuel.toLowerCase(),
        seats: Number(data.seats),
        price_per_hour: Number(data.pricePerHour || data.price_per_hour || 10),
        price_per_day: Number(data.pricePerDay || data.price_per_day),
        registration: data.registration,
        photo_url: data.image || data.photo_url || null,
        status: data.status || 'available',
      };
      if (data.fleetManagerId) payload.fleet_manager_id = Number(data.fleetManagerId);
      const response = await apiClient.post('/vehicles', payload);
      const v = response.data.vehicle;
      return {
        ...v,
        name: `${v.brand} ${v.model}`,
        pricePerDay: v.price_per_day,
        pricePerHour: v.price_per_hour,
        image: v.photo_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
      };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create vehicle');
    }
  },

  async updateVehicle(id, data) {
    try {
      const payload = {};
      if (data.brand !== undefined) payload.brand = data.brand;
      if (data.model !== undefined) payload.model = data.model;
      if (data.type !== undefined) payload.type = data.type;
      if (data.fuel !== undefined) payload.fuel = data.fuel;
      if (data.seats !== undefined) payload.seats = Number(data.seats);
      if (data.pricePerHour !== undefined) payload.price_per_hour = Number(data.pricePerHour);
      if (data.pricePerDay !== undefined) payload.price_per_day = Number(data.pricePerDay);
      if (data.registration !== undefined) payload.registration = data.registration;
      if (data.image !== undefined) payload.photo_url = data.image;
      if (data.status !== undefined) payload.status = data.status;
      if (data.fleetManagerId !== undefined) payload.fleet_manager_id = data.fleetManagerId ? Number(data.fleetManagerId) : null;

      const response = await apiClient.put(`/vehicles/${id}`, payload);
      const v = response.data.vehicle;
      return {
        ...v,
        name: `${v.brand} ${v.model}`,
        pricePerDay: v.price_per_day,
        pricePerHour: v.price_per_hour,
        image: v.photo_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
      };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update vehicle');
    }
  },

  async deleteVehicle(id) {
    try {
      await apiClient.delete(`/vehicles/${id}`);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete vehicle');
    }
  },

  async uploadVehicleImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await apiClient.post('/vehicles/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.photo_url;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to upload image');
    }
  },

  // ── Bookings ──────────────────────────────────────
  async estimateBooking(data) {
    try {
      const payload = {
        vehicle_id: data.vehicleId,
        start_date: new Date(data.startDate).toISOString(),
        end_date: new Date(data.endDate).toISOString()
      };
      const response = await apiClient.post('/bookings/estimate', payload);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to estimate booking');
    }
  },

  async createBooking(data) {
    try {
      const payload = {
        vehicle_id: data.vehicleId,
        start_date: new Date(data.startDate).toISOString(),
        end_date: new Date(data.endDate).toISOString()
      };
      const response = await apiClient.post('/bookings', payload);
      const b = response.data.booking;
      let displayStatus = b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase();
      if (b.status === 'PICKED_UP') displayStatus = 'Active';
      if (b.status === 'RETURNED' || b.status === 'CLOSED') displayStatus = 'Completed';
      
      return {
        ...b,
        vehicleId: b.vehicle_id,
        vehicleName: b.vehicle_name,
        vehicleImage: b.vehicle_image,
        userId: b.user_id,
        totalPrice: b.total_cost,
        startDate: b.start_date,
        endDate: b.end_date,
        createdAt: b.created_at,
        status: displayStatus
      };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create booking');
    }
  },

  async getBookings() {
    try {
      const response = await apiClient.get('/bookings');
      return response.data.bookings.map(b => {
        let displayStatus = b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase();
        if (b.status === 'PICKED_UP') displayStatus = 'Active';
        if (b.status === 'RETURNED' || b.status === 'CLOSED') displayStatus = 'Completed';
        
        return {
          ...b,
          vehicleId: b.vehicle_id,
          vehicleName: b.vehicle_name,
          vehicleImage: b.vehicle_image,
          userId: b.user_id,
          totalPrice: b.total_cost,
          startDate: b.start_date,
          endDate: b.end_date,
          createdAt: b.created_at,
          status: displayStatus
        };
      });
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async pickupBooking(id) {
    try {
      const response = await apiClient.patch(`/bookings/${id}/pickup`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to pickup booking');
    }
  },

  async returnBooking(id) {
    try {
      const response = await apiClient.patch(`/bookings/${id}/return`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to return booking');
    }
  },

  async cancelBooking(id) {
    try {
      const response = await apiClient.patch(`/bookings/${id}/cancel`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to cancel booking');
    }
  },

  async extendBooking(id, newEndDate) {
    try {
      const response = await apiClient.patch(`/bookings/${id}/extend`, { new_end_date: newEndDate });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to extend booking');
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

  // ── Admin: Reports ────────────────────────────────
  async getAdminReports() {
    try {
      const response = await apiClient.get('/admin/reports');
      return response.data.reports;
    } catch (err) {
      console.error('Error fetching reports:', err);
      return null;
    }
  },

  // ── Admin: Users ──────────────────────────────────
  async getUsers() {
    try {
      const response = await apiClient.get('/admin/users');
      return response.data.users;
    } catch (err) {
      console.error('Error fetching users:', err);
      return [];
    }
  },

  async createUser(data) {
    try {
      const response = await apiClient.post('/admin/users', data);
      return response.data.user;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create user');
    }
  },

  async updateUser(id, data) {
    try {
      const response = await apiClient.put(`/admin/users/${id}`, data);
      return response.data.user;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update user');
    }
  },

  async deleteUser(id) {
    try {
      await apiClient.delete(`/admin/users/${id}`);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete user');
    }
  },

  // ── Admin: Pricing Rules ──────────────────────────
  async getPricingRules() {
    try {
      const response = await apiClient.get('/admin/pricing-rules');
      return response.data.pricing_rules.map(r => ({
        ...r,
        isActive: r.active,
        value: r.multiplier,
      }));
    } catch (err) {
      console.error('Error fetching pricing rules:', err);
      return [];
    }
  },

  async createPricingRule(data) {
    try {
      const payload = {
        name: data.name,
        type: data.type.toLowerCase(),
        multiplier: Number(data.value || data.multiplier),
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        active: data.isActive !== undefined ? data.isActive : true,
      };
      const response = await apiClient.post('/admin/pricing-rules', payload);
      const r = response.data.rule;
      return { ...r, isActive: r.active, value: r.multiplier };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create pricing rule');
    }
  },

  async updatePricingRule(id, data) {
    try {
      const payload = {};
      if (data.active !== undefined) payload.active = data.active;
      if (data.isActive !== undefined) payload.active = data.isActive;
      if (data.name !== undefined) payload.name = data.name;
      if (data.multiplier !== undefined) payload.multiplier = data.multiplier;
      const response = await apiClient.put(`/admin/pricing-rules/${id}`, payload);
      const r = response.data.rule;
      return { ...r, isActive: r.active, value: r.multiplier };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update pricing rule');
    }
  },

  // ── Maintenance ───────────────────────────────────
  async getMaintenanceLogs() {
    try {
      const response = await apiClient.get('/maintenance');
      return response.data.maintenance_logs;
    } catch (err) {
      console.error('Error fetching maintenance logs:', err);
      return [];
    }
  },

  async createMaintenanceLog(data) {
    try {
      const payload = {
        vehicle_id: Number(data.vehicleId || data.vehicle_id),
        type: data.type,
        description: data.description || data.notes || '',
        cost: Number(data.cost || 0),
        next_due: data.next_due || null,
      };
      const response = await apiClient.post('/maintenance', payload);
      return response.data.log;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create maintenance log');
    }
  },

  async completeMaintenanceLog(id) {
    try {
      const response = await apiClient.patch(`/maintenance/${id}/complete`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to complete maintenance');
    }
  },
};
