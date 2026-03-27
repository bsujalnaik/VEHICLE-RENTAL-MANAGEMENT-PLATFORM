import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import AdminVehicles from './admin/AdminVehicles';
import AdminBookings from './admin/AdminBookings';
import AdminPricing from './admin/AdminPricing';
import AdminUsers from './admin/AdminUsers';
import './AdminDashboard.css';

const AdminOverview = () => {
  const { bookings, vehicles } = useApp();
  const [reports, setReports] = useState(null);
  
  useEffect(() => {
    api.getAdminReports().then(setReports).catch(console.error);
  }, []);

  const stats = reports ? [
    { label: 'Total Vehicles', value: reports.total_vehicles, icon: <img src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&q=80" alt="V" style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} />, color: 'blue' },
    { label: 'Active Rentals', value: reports.active_rentals, icon: <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=100&q=80" alt="A" style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} />, color: 'green' },
    { label: 'Total Revenue', value: `₹${reports.total_revenue}`, icon: <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&q=80" alt="R" style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} />, color: 'amber' },
    { label: 'Total Users', value: reports.total_users, icon: <img src="https://images.unsplash.com/photo-1549416878-b9ca35c2d47b?w=100&q=80" alt="M" style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} />, color: 'red' },
  ] : [];

  return (
    <>
      <div className="page-header mb-0">
        <h1>Admin Dashboard</h1>
        <p>Monitor platform performance and manage resources</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4 mb-32">
        {stats.map((s, idx) => (
          <div key={idx} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="admin-content grid grid-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) 400px' }}>
        
        <div className="card">
          <div className="card-header flex-between">
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Recent Bookings</h3>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map(b => {
                  const vehicle = vehicles.find(v => v.id === b.vehicleId);
                  return (
                    <tr key={b.id}>
                      <td className="font-semibold text-gray-500">{b.id}</td>
                      <td>{vehicle ? vehicle.name : `Vehicle #${b.vehicleId}`}</td>
                      <td>User #{b.userId}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td className="font-bold">₹{b.totalPrice}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Fleet Distribution</h3>
          </div>
          <div className="card-body">
            <div className="dist-list">
              {['Cars', 'Bikes', 'Vans'].map(type => {
                const typeKey = type.substring(0, type.length-1).toLowerCase();
                const items = vehicles.filter(v => v.type.toLowerCase() === typeKey);
                const available = items.filter(v => v.status === 'available').length;
                return (
                  <div key={type} className="dist-item mb-16">
                    <div className="flex-between mb-8">
                      <span className="font-semibold">{type}</span>
                      <span className="text-sm text-gray-500">{available} / {items.length} Available</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: items.length ? `${(available / items.length) * 100}%` : '0%', background: 'var(--primary)' }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const AdminDashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-main flex-col gap-24">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/vehicles" element={<AdminVehicles />} />
          <Route path="/bookings" element={<AdminBookings />} />
          <Route path="/pricing" element={<AdminPricing />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="*" element={<AdminOverview />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
