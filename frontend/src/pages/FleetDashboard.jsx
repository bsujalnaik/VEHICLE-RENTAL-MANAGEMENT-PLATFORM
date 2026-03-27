import React, { useState, useEffect } from 'react';
import { vehicleApi, adminApi } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import { LayoutGrid, ClipboardList, PenTool, AlertCircle, RefreshCw, Plus } from 'lucide-react';

const FleetDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBoard, setActiveBoard] = useState('inventory'); // inventory, maintenance

  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    try {
      const res = await vehicleApi.getAll();
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await vehicleApi.update(id, { availability_status: status });
      fetchFleet();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container py-12">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold font-heading mb-2">Fleet Management</h1>
          <p className="text-text-dim">Operational logistics and vehicle health board</p>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setActiveBoard('inventory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeBoard === 'inventory' ? 'bg-primary text-white' : 'text-text-dim hover:text-white'}`}
          >
            <LayoutGrid size={14} /> Inventory Board
          </button>
          <button 
            onClick={() => setActiveBoard('maintenance')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeBoard === 'maintenance' ? 'bg-primary text-white' : 'text-text-dim hover:text-white'}`}
          >
            <PenTool size={14} /> Maintenance Logs
          </button>
        </div>
      </div>

      {activeBoard === 'inventory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map(v => (
            <div key={v.vehicle_id} className="glass p-5 border-border-glass/40">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl border border-border-glass overflow-hidden">
                  <img src={v.photo_path} className="w-full h-full object-cover" />
                </div>
                <StatusBadge status={v.availability_status} />
              </div>
              <h4 className="font-bold text-sm mb-1">{v.brand} {v.model}</h4>
              <p className="text-[10px] text-text-dim uppercase tracking-wider mb-6">{v.registration_number}</p>
              
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-text-dim uppercase mb-2">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => updateStatus(v.vehicle_id, 'available')}
                    disabled={v.availability_status === 'available'}
                    className="py-2 rounded-lg bg-success/10 text-success text-[10px] font-bold hover:bg-success/20 disabled:opacity-30 disabled:grayscale transition-all"
                  >
                    Set Available
                  </button>
                  <button 
                    onClick={() => updateStatus(v.vehicle_id, 'maintenance')}
                    disabled={v.availability_status === 'maintenance'}
                    className="py-2 rounded-lg bg-admin/10 text-admin text-[10px] font-bold hover:bg-admin/20 disabled:opacity-30 disabled:grayscale transition-all"
                  >
                    Log Service
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass p-8 text-center bg-white/5 border-dashed">
          <ClipboardList size={48} className="mx-auto text-text-dim mb-4 opacity-30" />
          <h3 className="text-xl font-heading mb-2">Maintenance Tracking</h3>
          <p className="text-text-dim text-sm max-w-sm mx-auto mb-8">Detailed log of service history, part replacements, and cost analysis for each fleet unit.</p>
          <button className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} /> New Log Entry
          </button>
        </div>
      )}

      {/* Expiry Alerts Sidebar (Simulated as a panel) */}
      <div className="mt-16 bg-admin/5 border border-admin/10 rounded-2xl p-8">
        <h3 className="text-xl font-heading text-admin mb-6 flex items-center gap-2">
          <AlertCircle size={24} /> 
          Expiring Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.filter(v => v.availability_status === 'available').slice(0, 3).map((v, i) => (
            <div key={i} className="glass p-4 bg-bg-deep/50 border-admin/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-admin">INSURANCE EXPIRY</span>
                <span className="text-xs font-mono">14 Days Left</span>
              </div>
              <div className="text-sm font-semibold">{v.brand} {v.model}</div>
              <div className="text-[10px] text-text-dim mt-1">{v.registration_number}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FleetDashboard;
