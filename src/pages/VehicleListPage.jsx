import { useState, useEffect } from 'react';
import FilterPanel from '../components/FilterPanel';
import VehicleCard from '../components/VehicleCard';
import { useApp } from '../context/AppContext';
import './VehicleListPage.css';

const VehicleListPage = () => {
  const { vehicles: rawVehicles } = useApp();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', fuel: '', search: '', maxPrice: 300, availableOnly: false });
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    // Simulate network delay for UI UX 
    setLoading(true);
    const timeout = setTimeout(() => {
      let filtered = [...rawVehicles];
      
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(v => v.name.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q));
      }
      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(v => v.type.toLowerCase() === filters.type.toLowerCase());
      }
      if (filters.fuel && filters.fuel !== 'all') {
        filtered = filtered.filter(v => v.fuel.toLowerCase() === filters.fuel.toLowerCase());
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(v => v.pricePerDay <= filters.maxPrice);
      }
      if (filters.availableOnly) {
        filtered = filtered.filter(v => v.available);
      }
      
      setVehicles(filtered);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [filters, rawVehicles]);

  const handleFilter = (key, value) => {
    if (key === 'reset') {
      setFilters({ type: '', fuel: '', search: '', maxPrice: 300, availableOnly: false });
    } else {
      setFilters(f => ({ ...f, [key]: value }));
    }
  };

  const sorted = [...vehicles].sort((a, b) => {
    if (sortBy === 'price-asc')  return a.pricePerDay - b.pricePerDay;
    if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
    if (sortBy === 'rating')     return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="vlp-page page-content">
      <div className="container">
        {/* Header */}
        <div className="vlp-header">
          <div>
            <h1>Browse Vehicles</h1>
            <p>Choose from our premium fleet of {sorted.length} vehicles</p>
          </div>
          <div className="vlp-sort">
            <label>Sort by:</label>
            <select
              className="form-control"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="vlp-layout">
          {/* Sidebar */}
          <div className="vlp-sidebar">
            <FilterPanel filters={filters} onChange={handleFilter} />
          </div>

          {/* Grid */}
          <div className="vlp-grid-area">
            {loading ? (
              <div className="loading-screen">
                <div className="spinner" />
                <p>Loading vehicles...</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon" style={{ width: '80px', height: '80px', marginBottom: '16px' }}>
                  <img src="https://images.unsplash.com/photo-1584931423298-c576fda54bd2?w=200&q=80" alt="Not found" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
                <h3>No Vehicles Found</h3>
                <p>Try adjusting your filters or search term</p>
                <button className="btn btn-primary mt-16" onClick={() => handleFilter('reset')}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="vehicles-grid">
                {sorted.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleListPage;
