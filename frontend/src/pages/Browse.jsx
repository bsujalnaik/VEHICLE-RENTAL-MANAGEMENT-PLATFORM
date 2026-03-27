import React, { useState, useEffect } from 'react';
import { vehicleApi } from '../api/api';
import VehicleCard from '../components/VehicleCard';
import { Filter, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

const Browse = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    fuel_type: '',
    min_price: '',
    max_price: '',
    sort: 'newest'
  });

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleApi.getAll(filters);
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="glass p-6 sticky top-28">
            <div className="flex items-center gap-2 mb-8">
              <SlidersHorizontal size={18} className="text-primary" />
              <h2 className="font-heading text-lg">Filters</h2>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-3 block">Vehicle Type</label>
                <div className="flex flex-col gap-2">
                  {['car', 'bike', 'van'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setFilters({...filters, type: filters.type === t ? '' : t})}
                      className={`text-sm px-4 py-2.5 rounded-xl border border-border-glass text-left transition-all ${filters.type === t ? 'bg-primary border-primary text-white' : 'hover:bg-white/5'}`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-3 block">Fuel Type</label>
                <select 
                  className="w-full bg-white/5 border border-border-glass rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  onChange={(e) => setFilters({...filters, fuel_type: e.target.value})}
                >
                  <option value="">All Fuel Types</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-3 block">Price Range (Daily)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" placeholder="Min" 
                    className="bg-white/5 border border-border-glass rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    onChange={(e) => setFilters({...filters, min_price: e.target.value})}
                  />
                  <input 
                    type="number" placeholder="Max" 
                    className="bg-white/5 border border-border-glass rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    onChange={(e) => setFilters({...filters, max_price: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <section className="flex-1">
          <div className="flex items-center justify-between mb-8 glass p-4 rounded-2xl">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
              <input 
                type="text" 
                placeholder="Search brand or model..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-text-dim">Sort by:</span>
              <select 
                className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
                onChange={(e) => setFilters({...filters, sort: e.target.value})}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass p-4 h-[380px] flex flex-col gap-4">
                  <div className="skeleton flex-1 rounded-xl"></div>
                  <div className="skeleton h-4 w-1/3"></div>
                  <div className="skeleton h-6 w-2/3"></div>
                  <div className="skeleton h-12 w-full rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {vehicles.map(v => (
                <VehicleCard key={v.vehicle_id} vehicle={v} onBook={() => window.location.href = `/vehicle/${v.vehicle_id}`} />
              ))}
            </div>
          ) : (
            <div className="glass p-20 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-text-dim">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-heading mb-2">No vehicles found</h3>
              <p className="text-text-dim">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Browse;
