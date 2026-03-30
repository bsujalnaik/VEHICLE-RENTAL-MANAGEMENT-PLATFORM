import './FilterPanel.css';

/* -------- SVG Icons -------- */
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="6" cy="6" r="4"/>
    <path d="M9.5 9.5l3 3"/>
  </svg>
);

const FilterPanel = ({ filters, onChange }) => {
  const handleChange = (key, value) => onChange(key, value);

  const vehicleTypes = [
    { value: '',    label: 'All Types' },
    { value: 'car', label: 'Cars' },
    { value: 'bike', label: 'Bikes' },
    { value: 'van',  label: 'Vans' },
  ];

  const fuelTypes = ['Petrol', 'Diesel', 'Electric'];

  return (
    <aside className="filter-panel">
      <div className="filter-panel-header">
        <span className="filter-panel-title">Filters</span>
        <button className="filter-clear" onClick={() => onChange('reset')}>
          Clear All
        </button>
      </div>

      {/* Search */}
      <div className="filter-section">
        <label className="filter-label">Search</label>
        <div className="filter-search-wrap">
          <span className="filter-search-icon"><IconSearch /></span>
          <input
            id="filter-search"
            type="text"
            className="form-control filter-search-input"
            placeholder="Make or model..."
            value={filters.search || ''}
            onChange={e => handleChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Vehicle Type */}
      <div className="filter-section">
        <label className="filter-label">Vehicle Type</label>
        <div className="filter-type-pills">
          {vehicleTypes.map(opt => (
            <button
              key={opt.value}
              id={`filter-type-${opt.value || 'all'}`}
              className={`type-pill ${filters.type === opt.value ? 'active' : ''}`}
              onClick={() => handleChange('type', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div className="filter-section">
        <label className="filter-label">Fuel Type</label>
        <div className="filter-radio-group">
          <label className={`filter-radio-item ${!filters.fuel ? 'active' : ''}`}>
            <input
              type="radio"
              name="fuel"
              value=""
              checked={!filters.fuel}
              onChange={() => handleChange('fuel', '')}
            />
            <span className="radio-custom" />
            <span>All</span>
          </label>
          {fuelTypes.map(fuel => (
            <label key={fuel} className={`filter-radio-item ${filters.fuel === fuel ? 'active' : ''}`}>
              <input
                type="radio"
                name="fuel"
                value={fuel}
                checked={filters.fuel === fuel}
                onChange={e => handleChange('fuel', e.target.value)}
              />
              <span className="radio-custom" />
              <span>{fuel}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <label className="filter-label">
          Max Price — <strong style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
            ₹{filters.maxPrice || 30000}/day
          </strong>
        </label>
        <input
          id="filter-price-range"
          type="range"
          min="1000"
          max="30000"
          step="500"
          value={filters.maxPrice || 30000}
          onChange={e => handleChange('maxPrice', Number(e.target.value))}
          className="price-range"
        />
        <div className="range-labels">
          <span>₹1000</span>
          <span>₹30000</span>
        </div>
      </div>

      {/* Availability */}
      <div className="filter-section">
        <label className="filter-label">Availability</label>
        <label className="filter-toggle">
          <input
            id="filter-available-only"
            type="checkbox"
            checked={filters.availableOnly || false}
            onChange={e => handleChange('availableOnly', e.target.checked)}
          />
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>
          <span className="toggle-label">Available only</span>
        </label>
      </div>
    </aside>
  );
};

export default FilterPanel;
