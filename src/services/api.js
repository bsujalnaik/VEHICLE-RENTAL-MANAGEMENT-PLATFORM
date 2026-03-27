import { vehicles } from '../data/mockData';

// Simulate network delay
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

export const api = {
  // Auth
  async login({ email, password, role }) {
    await delay();
    if (!email || !password) throw new Error('Invalid credentials');
    const users = {
      'admin@vrmp.com':   { id: 'u1', name: 'Admin User',   email, role: 'admin' },
      'fleet@vrmp.com':   { id: 'u2', name: 'Fleet Manager',email, role: 'fleet' },
      'customer@vrmp.com':{ id: 'u3', name: 'Jane Customer',email, role: 'customer' },
    };
    const user = users[email] || { id: 'u99', name: email.split('@')[0], email, role: role || 'customer' };
    return { user, token: 'mock-jwt-token' };
  },

  async register({ name, email, password, role }) {
    await delay();
    if (!name || !email || !password) throw new Error('All fields required');
    return { user: { id: 'u' + Date.now(), name, email, role: role || 'customer' }, token: 'mock-jwt-token' };
  },

  // Vehicles
  async getVehicles(filters = {}) {
    await delay();
    let data = [...vehicles];
    if (filters.type)   data = data.filter(v => v.type === filters.type);
    if (filters.fuel)   data = data.filter(v => v.fuel.toLowerCase() === filters.fuel.toLowerCase());
    if (filters.maxPrice) data = data.filter(v => v.pricePerDay <= filters.maxPrice);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(v => v.name.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q));
    }
    return data;
  },

  async getVehicleById(id) {
    await delay(200);
    const v = vehicles.find(v => v.id === Number(id));
    if (!v) throw new Error('Vehicle not found');
    return v;
  },

  async updateVehicleAvailability(id, available) {
    await delay();
    const v = vehicles.find(v => v.id === Number(id));
    if (v) v.available = available;
    return { success: true };
  },

  // Bookings
  async createBooking(data) {
    await delay(600);
    return { id: 'BK' + Date.now(), ...data, status: 'Booked', createdAt: new Date().toISOString() };
  },

  async getBookings() {
    await delay();
    return [];
  },

  // Payments
  async processPayment({ bookingId, method, amount }) {
    await delay(1000);
    return { success: true, transactionId: 'TXN' + Date.now(), bookingId, method, amount };
  },
};
