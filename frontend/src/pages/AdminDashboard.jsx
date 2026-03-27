import React, { useState, useEffect } from 'react';
import { adminApi, vehicleApi } from '../api/api';
import { TrendingUp, Users, Car, AlertTriangle, Search, Plus, MoreVertical, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ revenue: 0, active_rentals: 0, total_vehicles: 0, pending_maintenance: 0 });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    type: 'car', brand: '', model: '', fuel_type: 'petrol', seating_capacity: 5,
    price_per_hour: 0, price_per_day: 0, registration_number: '', photo_path: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, vehicleRes] = await Promise.all([
        adminApi.getStats(),
        vehicleApi.getAll()
      ]);
      setStats(statsRes.data);
      setVehicles(vehicleRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await vehicleApi.add(newVehicle);
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to add vehicle");
    }
  };

  const statCards = [
    { label: 'Monthly Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <TrendingUp />, color: 'text-success' },
    { label: 'Active Rentals', value: stats.active_rentals, icon: <Users />, color: 'text-primary' },
    { label: 'Total Fleet', value: stats.total_vehicles, icon: <Car />, color: 'text-white' },
    { label: 'Maintenance Alerts', value: stats.pending_maintenance, icon: <AlertTriangle />, color: 'text-admin' },
  ];

  return (
    <div className="container py-12">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold font-heading mb-2">Admin Dashboard</h1>
          <p className="text-text-dim">Fleet performance and operations overview</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Register New Vehicle
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((card, i) => (
          <div key={i} className="glass p-6">
            <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 ${card.color}`}>
              {card.icon}
            </div>
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">{card.label}</div>
            <div className={`text-2xl font-bold font-heading ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Fleet Table */}
      <div className="glass overflow-hidden">
        <div className="p-6 border-b border-border-glass flex items-center justify-between bg-white/5">
          <h3 className="font-heading">Fleet Management</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input 
              type="text" placeholder="Filter fleet..." 
              className="bg-bg-deep border border-border-glass rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-text-dim uppercase tracking-widest border-b border-border-glass">
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Reg. No</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Price/Day</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-glass/50">
              {vehicles.map((v) => (
                <tr key={v.vehicle_id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border-glass">
                        <img src={v.photo_path} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{v.brand} {v.model}</div>
                        <div className="text-[10px] text-text-dim uppercase">{v.type} • {v.fuel_type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{v.registration_number}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={v.availability_status} />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">₹{v.price_per_day}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-text-dim hover:text-white">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-sm">
          <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-heading">Register New Vehicle</h2>
                <button onClick={() => setShowAddModal(false)} className="hover:text-primary transition-colors"><X/></button>
              </div>

              <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-text-dim uppercase mb-2 block">Brand</label>
                  <input 
                    type="text" required className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-dim uppercase mb-2 block">Model</label>
                  <input 
                    type="text" required className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-dim uppercase mb-2 block">Vehicle Type</label>
                  <select 
                    className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                  >
                    <option value="car" className='bg-bg-deep'>Luxury Car</option>
                    <option value="bike" className='bg-bg-deep'>Sport Bike</option>
                    <option value="van" className='bg-bg-deep'>Premium Van</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-dim uppercase mb-2 block">Fuel Type</label>
                  <select 
                    className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    onChange={(e) => setNewVehicle({...newVehicle, fuel_type: e.target.value})}
                  >
                    <option value="petrol" className='bg-bg-deep'>Petrol</option>
                    <option value="diesel" className='bg-bg-deep'>Diesel</option>
                    <option value="electric" className='bg-bg-deep'>Electric</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-dim uppercase mb-2 block">Registration No.</label>
                  <input 
                    type="text" required className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    placeholder="KA-00-XX-0000"
                    onChange={(e) => setNewVehicle({...newVehicle, registration_number: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-dim uppercase mb-2 block">Daily Price (₹)</label>
                  <input 
                    type="number" required className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    onChange={(e) => setNewVehicle({...newVehicle, price_per_day: e.target.value, price_per_hour: e.target.value/24})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-text-dim uppercase mb-2 block">Photo URL</label>
                  <input 
                    type="text" className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => setNewVehicle({...newVehicle, photo_path: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2 pt-6">
                  <button type="submit" className="btn-primary w-full h-14 text-base">Add Vehicle to Fleet</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
