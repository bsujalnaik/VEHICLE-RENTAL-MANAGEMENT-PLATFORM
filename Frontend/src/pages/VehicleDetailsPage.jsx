import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './VehicleDetailsPage.css';

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
      if (v) {
        setVehicle(v);
        setError(null);
      } else {
        setError("The vehicle you're looking for doesn't exist or has been removed.");
      }
      setLoading(false);
    }, 400); // Simulate network load
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
        <div className="empty-icon" style={{ fontSize: '2rem' }}>X</div>
        <h3>Vehicle Not Found</h3>
        <p>{error || "The vehicle you're looking for doesn't exist or has been removed."}</p>
        <Link to="/vehicles" className="btn btn-primary mt-16">Browse All Vehicles</Link>
      </div>
    </div>
  );

  const images = [
    vehicle.image,
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80'
  ];

  return (
    <div className="vdp-page page-content">
      <div className="container">
        <div className="vdp-breadcrumbs">
          <Link to="/vehicles">Vehicles</Link>
          <span className="separator">/</span>
          <span>{vehicle.brand}</span>
          <span className="separator">/</span>
          <span className="current">{vehicle.name}</span>
        </div>

        <div className="vdp-layout">
          {/* Left: Images */}
          <div className="vdp-gallery">
            <div className="vdp-img-main">
              <img src={images[selectedImage]} alt={vehicle.name} />
              {!vehicle.available && <div className="vdp-unavailable-badge">Currently Unavailable</div>}
            </div>
            <div className="vdp-img-thumbs">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`vdp-thumb ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`Thumb ${idx}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="vdp-info">
            <div className="vdp-header">
              <div>
                <div className="vdp-brand">{vehicle.brand}</div>
                <h1 className="vdp-title">{vehicle.name} {vehicle.year}</h1>
              </div>
              <div className="vdp-rating">
                <span className="star"></span>
                <span className="rating-val">{vehicle.rating}</span>
                <span className="rating-count">({vehicle.reviews} reviews)</span>
              </div>
            </div>

            <p className="vdp-desc">{vehicle.description}</p>

            <div className="vdp-specs-grid">
              <div className="vdp-spec-box">
                <img src="https://images.unsplash.com/photo-1599256872237-5dcc0fbe966a?w=100&q=80" alt="Fuel" style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                <div className="vs-val">{vehicle.fuel}</div>
                <div className="vs-lbl">Fuel Type</div>
              </div>
              <div className="vdp-spec-box">
                <img src="https://images.unsplash.com/photo-1549416878-b9ca35c2d47b?w=100&q=80" alt="Seats" style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                <div className="vs-val">{vehicle.seats}</div>
                <div className="vs-lbl">Seats</div>
              </div>
              <div className="vdp-spec-box">
                <img src="https://images.unsplash.com/photo-1562141989-c5c79ac8f576?w=100&q=80" alt="Transmission" style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                <div className="vs-val">{vehicle.transmission}</div>
                <div className="vs-lbl">Transmission</div>
              </div>
              <div className="vdp-spec-box">
                <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=100&q=80" alt="Mileage" style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                <div className="vs-val">{vehicle.mileage}</div>
                <div className="vs-lbl">Mileage</div>
              </div>
            </div>

            <div className="vdp-features">
              <h3>Key Features</h3>
              <ul className="vdp-feature-list">
                {vehicle.features.map((f, i) => (
                  <li key={i}><span className="check" style={{ color: 'var(--primary)' }}>•</span> {f}</li>
                ))}
              </ul>
            </div>

            <div className="vdp-action-box">
              <div className="vdp-price">
                <div className="price-top">
                  <h2>₹{vehicle.pricePerDay}</h2>
                  <span>/ day</span>
                </div>
                <div className="price-sub">or ₹{vehicle.pricePerHour} / hour</div>
              </div>
              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={() => navigate(`/book/${vehicle.id}`)}
                disabled={!vehicle.available}
              >
                {vehicle.available ? 'Continue to Booking' : 'Not Available Right Now'}
              </button>
              {!vehicle.available && (
                <p className="vdp-hint text-center mt-8 text-danger">
                  This vehicle is currently booked or under maintenance.
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
