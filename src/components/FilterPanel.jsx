import './FilterPanel.css';

const FilterPanel = ({ filters, onChange }) => {
  const handleChange = (key, value) => onChange(key, value);

  return (
    <aside className="filter-panel">
      <div className="filter-header">
        <h3> Filters</h3>
        <button
          className="filter-clear-btn"
          onClick={() => onChange('reset')}
        >
          Reset All
        </button>
      </div>

      {/* Search */}
      <div className="filter-section">
        <label className="filter-label">Search</label>
        <div className="search-bar">
          <span className="search-icon"></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search vehicles..."
            value={filters.search || ''}
            onChange={e => handleChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Vehicle Type */}
      <div className="filter-section">
        <label className="filter-label">Vehicle Type</label>
        <div className="filter-type-grid">
          {[
            { value: '', label: 'All', icon: '•' },
            { value: 'car', label: 'Cars', icon: '' },
            { value: 'bike', label: 'Bikes', icon: '️' },
            { value: 'van', label: 'Vans', icon: '' },
          ].map(opt => (
            <button
              key={opt.value}
              className={`type-btn ${filters.type === opt.value ? 'active' : ''}`}
              onClick={() => handleChange('type', opt.value)}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div className="filter-section">
        <label className="filter-label">Fuel Type</label>
        <div className="filter-checkbox-group">
          {['Petrol', 'Diesel', 'Electric'].map(fuel => (
            <label key={fuel} className="filter-checkbox-item">
              <input
                type="radio"
                name="fuel"
                value={fuel}
                checked={filters.fuel === fuel}
                onChange={e => handleChange('fuel', e.target.value)}
              />
              <span>{fuel === 'Petrol' ? 'Fuel:' : fuel === 'Diesel' ? '️' : ''} {fuel}</span>
            </label>
          ))}
          <label className="filter-checkbox-item">
            <input
              type="radio"
              name="fuel"
              value=""
              checked={!filters.fuel}
              onChange={() => handleChange('fuel', '')}
            />
            <span>• All Fuels</span>
          </label>
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <label className="filter-label">
          Max Price: <strong>₹{filters.maxPrice || 300}/day</strong>
        </label>
        <input
          type="range"
          min="30"
          max="300"
          step="10"
          value={filters.maxPrice || 300}
          onChange={e => handleChange('maxPrice', Number(e.target.value))}
          className="price-range"
        />
        <div className="range-labels">
          <span>₹30</span>
          <span>₹300</span>
        </div>
      </div>

      {/* Availability */}
      <div className="filter-section">
        <label className="filter-label">Availability</label>
        <label className="filter-checkbox-item">
          <input
            type="checkbox"
            checked={filters.availableOnly || false}
            onChange={e => handleChange('availableOnly', e.target.checked)}
          />
          <span> Available Only</span>
        </label>
      </div>
    </aside>
  );
};

export default FilterPanel;
