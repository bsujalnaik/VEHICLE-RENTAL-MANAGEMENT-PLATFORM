import { useState, useEffect } from 'react';
import FilterPanel from '../components/FilterPanel';
import VehicleCard from '../components/VehicleCard';
import { useApp } from '../context/AppContext';
import './VehicleListPage.css';

const VehicleListPage = () => {
  const { vehicles: rawVehicles } = useApp();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', fuel: '', search: '', maxPrice: 30000, availableOnly: false });
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
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
        filtered = filtered.filter(v => v.status === 'available');
      }
      setVehicles(filtered);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [filters, rawVehicles]);

  const handleFilter = (key, value) => {
    if (key === 'reset') {
      setFilters({ type: '', fuel: '', search: '', maxPrice: 30000, availableOnly: false });
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
      {/* Editorial header */}
      <div className="vlp-hero">
        <div className="vlp-hero-bg" />
        <div className="container">
          <div className="vlp-header">
            <div>
              <span className="section-label">Our Fleet</span>
              <h1 className="vlp-title">Browse Vehicles</h1>
              <p className="vlp-subtitle">
                {loading ? 'Loading...' : `${sorted.length} vehicle${sorted.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
            <div className="vlp-sort">
              <label className="form-label" htmlFor="sort-select">Sort</label>
              <select
                id="sort-select"
                className="form-control vlp-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="vlp-layout">
          {/* Filter sidebar */}
          <div className="vlp-sidebar">
            <FilterPanel filters={filters} onChange={handleFilter} />
          </div>

          {/* Vehicle grid */}
          <div className="vlp-grid-area">
            {loading ? (
              <div className="loading-screen">
                <div className="spinner" />
                <p>Loading fleet...</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="3" y="8" width="18" height="15" rx="2"/>
                    <path d="M21 13h3.5l4.5 5v5h-8V13z"/>
                    <circle cx="8" cy="25" r="2.5"/>
                    <circle cx="22" cy="25" r="2.5"/>
                  </svg>
                </div>
                <h3>No Vehicles Found</h3>
                <p>Try adjusting your filters or removing the search term.</p>
                <button className="btn btn-secondary mt-16" onClick={() => handleFilter('reset')}>
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
