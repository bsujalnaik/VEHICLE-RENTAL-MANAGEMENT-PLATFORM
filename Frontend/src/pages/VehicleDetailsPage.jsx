import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './VehicleDetailsPage.css';

/* -------- SVG Icons -------- */
const IconFuel = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="3" y="3" width="11" height="18" rx="1.5"/>
    <path d="M14 7h2.5a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 001.5 1.5h0"/>
    <path d="M7 9h3M7 13h3"/>
  </svg>
);

const IconSeat = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 4v10l3 3h9V13H8V4H5z"/>
    <circle cx="5" cy="20" r="2"/>
    <circle cx="18" cy="20" r="2"/>
  </svg>
);

const IconGear = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="12" cy="12" r="3.5"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1"/>
  </svg>
);

const IconCar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M5 11l2-5h10l2 5"/>
    <rect x="2" y="11" width="20" height="8" rx="1.5"/>
    <circle cx="7" cy="21" r="2"/>
    <circle cx="17" cy="21" r="2"/>
    <path d="M2 15h20"/>
  </svg>
);

const IconPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="9" r="4"/>
    <path d="M12 22C12 22 4 14 4 9a8 8 0 0116 0c0 5-8 13-8 13z"/>
  </svg>
);

const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#C9A84C">
    <path d="M12 2l3.1 6.4 7 1-5.1 4.9 1.2 6.9L12 18l-6.2 3.2 1.2-6.9L2 9.4l7-1L12 2z"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#C9A84C" strokeWidth="1.8">
    <path d="M2 7l3.5 3.5 6.5-6"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
);

/* -------- Component -------- */
const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles } = useApp();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      const v = vehicles.find(x => x.id === parseInt(id) || String(x.id) === id);
      if (v) { setVehicle(v); setError(null); }
      else   { setError("The vehicle you're looking for doesn't exist or has been removed."); }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [id, vehicles]);

  if (loading) return (
    <div className="page-content flex-center" style={{ minHeight: '80vh' }}>
      <div className="spinner" />
    </div>
  );

  if (error || !vehicle) return (
    <div className="page-content container">
      <div className="empty-state">
        <div className="empty-icon"><IconCar /></div>
        <h3>Vehicle Not Found</h3>
        <p>{error}</p>
        <Link to="/vehicles" className="btn btn-secondary mt-16">Browse Fleet</Link>
      </div>
    </div>
  );

  const images = [
    vehicle.image,
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
  ];

  const specs = [
    { icon: <IconFuel />,  value: vehicle.fuel,                   label: 'Fuel Type' },
    { icon: <IconSeat />,  value: `${vehicle.seats}`,            label: 'Seats' },
    { icon: <IconGear />,  value: vehicle.transmission || 'Auto', label: 'Transmission' },
    { icon: <IconCar />,   value: vehicle.type,                   label: 'Category', capitalize: true },
  ];

  const features = vehicle.features || ['Air Conditioning', 'GPS Navigation', 'Bluetooth Audio', 'USB Charging'];

  return (
    <div className="vdp-page page-content">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="vdp-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/vehicles">Fleet</Link>
          <span className="bc-sep">/</span>
          <span>{vehicle.brand}</span>
          <span className="bc-sep">/</span>
          <span className="bc-current">{vehicle.name}</span>
        </nav>

        <div className="vdp-layout">
          {/* ---- Image Gallery ---- */}
          <div className="vdp-gallery">
            <div className="vdp-main-image">
              <img src={images[selectedImage]} alt={vehicle.name} />
              {vehicle.status !== 'available' && (
                <div className="vdp-unavail-overlay">Currently Unavailable</div>
              )}
            </div>
            <div className="vdp-thumbs">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`vdp-thumb ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img} alt={`View ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* ---- Details ---- */}
          <div className="vdp-info">
            {/* Header */}
            <div className="vdp-header">
              <div>
                <div className="vdp-brand">{vehicle.brand}</div>
                <h1 className="vdp-title">{vehicle.name} {vehicle.year}</h1>
              </div>
              <div className="vdp-rating">
                <IconStar />
                <span className="rating-val">{vehicle.rating}</span>
                <span className="rating-count">({vehicle.reviews} reviews)</span>
              </div>
            </div>

            {/* Location */}
            {vehicle.location && (
              <div className="vdp-location">
                <IconPin />
                {vehicle.location}
              </div>
            )}

            {/* Description */}
            <p className="vdp-desc">{vehicle.description}</p>

            {/* Specs grid */}
            <div className="vdp-specs">
              {specs.map((s, i) => (
                <div key={i} className="vdp-spec-box">
                  <div className="spec-icon">{s.icon}</div>
                  <div className={`spec-val ${s.capitalize ? 'capitalize' : ''}`}>{s.value}</div>
                  <div className="spec-lbl">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="vdp-features">
              <h3 className="vdp-features-title">Key Features</h3>
              <ul className="vdp-feature-list">
                {features.map((f, i) => (
                  <li key={i}>
                    <span className="feature-check"><IconCheck /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action box */}
            <div className="vdp-action-box">
              <div className="vdp-price">
                <div className="price-main">
                  <span className="price-currency">₹</span>
                  <span className="price-amount">{vehicle.pricePerDay}</span>
                  <span className="price-per">/ day</span>
                </div>
                <div className="price-alt">₹{vehicle.pricePerHour} / hour</div>
              </div>

              <button
                className="btn btn-primary btn-lg btn-full vdp-book-btn"
                onClick={() => navigate(`/book/${vehicle.id}`)}
                disabled={vehicle.status !== 'available'}
                id="vdp-book-btn"
              >
                {vehicle.status === 'available'
                  ? <> Reserve Now <IconArrow /></>
                  : 'Currently Unavailable'
                }
              </button>

              {vehicle.status !== 'available' && (
                <p className="vdp-unavail-note">
                  This vehicle is not available for booking at this time.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
