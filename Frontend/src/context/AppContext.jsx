import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [toasts, setToasts] = useState([]);
  
  // Global State for Mock Data
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Fetch initial data from Backend API
  useEffect(() => {
    api.getVehicles().then(setVehicles).catch(console.error);
    if (user) {
      api.getBookings().then(setBookings).catch(console.error);
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

  // Bookings
  const addBooking = useCallback((booking) => {
    setBookings(prev => [...prev, { ...booking, id: 'BK' + (prev.length + 1).toString().padStart(3, '0') }]);
  }, []);
  const updateBookingStatus = useCallback((id, status) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }, []);

  // Vehicles
  const addVehicle = useCallback((v) => {
    setVehicles(prev => [...prev, { ...v, id: prev.length ? Math.max(...prev.map(p=>p.id)) + 1 : 1 }]);
  }, []);
  const updateVehicle = useCallback((id, updates) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }, []);
  const deleteVehicle = useCallback((id) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  }, []);

  // Maintenance
  const addMaintenanceLog = useCallback((log) => {
    setMaintenanceLogs(prev => [...prev, { ...log, id: prev.length ? Math.max(...prev.map(p=>p.id)) + 1 : 1 }]);
  }, []);
  const updateMaintenanceLog = useCallback((id, updates) => {
    setMaintenanceLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  // Pricing
  const addPricingRule = useCallback((rule) => {
    setPricingRules(prev => [...prev, { ...rule, id: prev.length ? Math.max(...prev.map(p=>p.id)) + 1 : 1 }]);
  }, []);
  const togglePricingRule = useCallback((id) => {
    setPricingRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  }, []);
  const deletePricingRule = useCallback((id) => {
    setPricingRules(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      toasts, addToast, removeToast,
      bookings, addBooking, updateBookingStatus,
      vehicles, addVehicle, updateVehicle, deleteVehicle,
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
