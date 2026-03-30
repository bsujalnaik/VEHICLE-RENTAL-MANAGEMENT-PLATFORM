import { Link } from 'react-router-dom';
import './VehicleCard.css';

/* -------- SVG spec icons -------- */
const IconFuel = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
    <rect x="2" y="2" width="7" height="11" rx="1"/>
    <path d="M9 5h1.5a1 1 0 011 1v3a1 1 0 001 1h0"/>
    <path d="M5 6h1M5 8.5h1"/>
  </svg>
);

const IconSeat = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M3 2v6l2 2h5v-2H5V2H3z"/>
    <circle cx="3" cy="11.5" r="1"/>
    <circle cx="11" cy="11.5" r="1"/>
  </svg>
);

const IconGear = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
    <circle cx="7" cy="7" r="2"/>
    <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.9 2.9l1.4 1.4M9.7 9.7l1.4 1.4M2.9 11.1l1.4-1.4M9.7 4.3l1.4-1.4"/>
  </svg>
);

const IconStar = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="#C9A84C">
    <path d="M6 1l1.4 2.9 3.1.4-2.25 2.2.53 3.1L6 8.15 3.22 9.6l.53-3.1L1.5 4.3l3.1-.4L6 1z"/>
  </svg>
);

const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 7h10M8 3l4 4-4 4"/>
  </svg>
);

const VehicleCard = ({ vehicle }) => {
  const { id, name, image, pricePerDay, fuel, seats, type, status, rating, reviews, transmission } = vehicle;
  const available = status === 'available';

  return (
    <article className="vehicle-card">
      {/* Image area */}
      <div className="vc-image-wrap">
        <img
          src={image}
          alt={name}
          className="vc-image"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80'; }}
          loading="lazy"
        />

        {/* Overlays */}
        <div className="vc-image-gradient" />

        <div className={`vc-status-chip ${available ? 'available' : 'unavailable'}`}>
          <span className="vc-status-dot" />
          {available ? 'Available' : 'Unavailable'}
        </div>

        <div className="vc-type-chip">
          {type}
        </div>
      </div>

      {/* Body */}
      <div className="vc-body">
        <div className="vc-top">
          <h3 className="vc-name">{name}</h3>
          <div className="vc-rating">
            <IconStar />
            <span className="rating-val">{rating}</span>
            <span className="rating-count">({reviews})</span>
          </div>
        </div>

        {vehicle.location && (
          <div className="vc-location">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="7" cy="5.5" r="2.5"/>
              <path d="M7 13C7 13 2 8.5 2 5.5a5 5 0 0110 0C12 8.5 7 13 7 13z"/>
            </svg>
            {vehicle.location}
          </div>
        )}

        <div className="vc-specs">
          <div className="vc-spec">
            <IconFuel />
            <span>{fuel}</span>
          </div>
          <div className="vc-spec">
            <IconSeat />
            <span>{seats} seats</span>
          </div>
          <div className="vc-spec">
            <IconGear />
            <span>{transmission}</span>
          </div>
        </div>

        <div className="vc-footer">
          <div className="vc-price">
            <span className="price-amount">₹{pricePerDay}</span>
            <span className="price-unit">/ day</span>
          </div>
          <Link
            to={`/vehicles/${id}`}
            id={`vehicle-card-${id}`}
            className={`vc-cta-btn ${!available ? 'vc-cta-disabled' : ''}`}
            tabIndex={available ? 0 : -1}
            aria-disabled={!available}
          >
            {available ? (
              <>{`View Details`} <IconArrow /></>
            ) : (
              'Unavailable'
            )}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default VehicleCard;
