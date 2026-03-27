import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [toasts, setToasts] = useState([]);
  
  // Global State
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Fetch data from Backend API
  useEffect(() => {
    api.getVehicles().then(setVehicles).catch(console.error);

    if (user) {
      api.getBookings().then(setBookings).catch(console.error);

      // Admin and fleet users get extra data
      if (user.role === 'admin' || user.role === 'fleet') {
        api.getMaintenanceLogs().then(logs => {
          setMaintenanceLogs(logs.map(l => ({
            ...l,
            vehicleId: l.vehicle_id,
            notes: l.description,
            status: 'Pending', // backend doesn't track completion status directly
          })));
        }).catch(console.error);
      }

      if (user.role === 'admin') {
        api.getPricingRules().then(setPricingRules).catch(console.error);
      }
    }
  }, [user]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const login = useCallback((userData) => { setUser(userData); }, []);
  const logout = useCallback(() => { 
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null); 
  }, []);

  // Bookings — calls backend API
  const addBooking = useCallback((booking) => {
    setBookings(prev => [...prev, booking]);
  }, []);
  const updateBookingStatus = useCallback((id, status) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }, []);

  // Vehicles — all operations go through backend API
  const addVehicle = useCallback(async (v) => {
    try {
      const created = await api.createVehicle(v);
      setVehicles(prev => [...prev, created]);
      return created;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateVehicle = useCallback(async (id, updates) => {
    try {
      const updated = await api.updateVehicle(id, updates);
      setVehicles(prev => prev.map(v => v.id === id ? updated : v));
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteVehicle = useCallback(async (id) => {
    try {
      await api.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  // Maintenance — calls backend API
  const addMaintenanceLog = useCallback(async (log) => {
    try {
      const created = await api.createMaintenanceLog(log);
      setMaintenanceLogs(prev => [...prev, {
        ...created,
        vehicleId: created.vehicle_id,
        notes: created.description,
        status: 'Pending',
      }]);
      return created;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateMaintenanceLog = useCallback(async (id, updates) => {
    if (updates.status === 'Completed') {
      try {
        await api.completeMaintenanceLog(id);
        setMaintenanceLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
      } catch (err) {
        throw err;
      }
    } else {
      setMaintenanceLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    }
  }, []);

  // Pricing — calls backend API
  const addPricingRule = useCallback(async (rule) => {
    try {
      const created = await api.createPricingRule(rule);
      setPricingRules(prev => [...prev, created]);
      return created;
    } catch (err) {
      throw err;
    }
  }, []);

  const togglePricingRule = useCallback(async (id) => {
    const rule = pricingRules.find(r => r.id === id);
    if (!rule) return;
    try {
      const updated = await api.updatePricingRule(id, { active: !rule.isActive });
      setPricingRules(prev => prev.map(r => r.id === id ? updated : r));
    } catch (err) {
      throw err;
    }
  }, [pricingRules]);

  const deletePricingRule = useCallback(async (id) => {
    // Backend doesn't have a delete pricing rule endpoint, so we toggle it to inactive
    try {
      const updated = await api.updatePricingRule(id, { active: false });
      setPricingRules(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  // Refresh helpers
  const refreshVehicles = useCallback(() => {
    api.getVehicles().then(setVehicles).catch(console.error);
  }, []);

  const refreshBookings = useCallback(() => {
    api.getBookings().then(setBookings).catch(console.error);
  }, []);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      toasts, addToast, removeToast,
      bookings, addBooking, updateBookingStatus, refreshBookings,
      vehicles, addVehicle, updateVehicle, deleteVehicle, refreshVehicles,
      maintenanceLogs, addMaintenanceLog, updateMaintenanceLog,
      pricingRules, addPricingRule, togglePricingRule, deletePricingRule
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
