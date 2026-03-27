import { Link } from 'react-router-dom';
import './VehicleCard.css';

const VehicleCard = ({ vehicle }) => {
  const { id, name, image, pricePerDay, fuel, seats, type, status, rating, reviews, transmission } = vehicle;
  const available = status === 'available';

  const typeEmoji = { car: '', bike: '️', van: '' };

  return (
    <div className="vehicle-card">
      {/* Image */}
      <div className="vehicle-card-image-wrap">
        <img
          src={image}
          alt={name}
          className="vehicle-card-image"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&q=80'; }}
        />
        <div className={`availability-chip ${status === 'available' ? 'avail' : 'unavail'}`}>
          {status === 'available' ? ' Available' : ' Unavailable'}
        </div>
        <div className="type-chip">{typeEmoji[type] || ''} {type}</div>
      </div>

      {/* Body */}
      <div className="vehicle-card-body">
        <div className="vc-top">
          <h3 className="vc-name">{name}</h3>
          <div className="vc-rating">
            <span className="star"></span>
            <span className="rating-val">{rating}</span>
            <span className="rating-count">({reviews})</span>
          </div>
        </div>
        {vehicle.location && (
          <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '1rem' }}>📍</span> {vehicle.location}
          </div>
        )}

        <div className="vc-specs">
          <div className="vc-spec">
            <span className="spec-icon">Fuel:</span>
            <span>{fuel}</span>
          </div>
          <div className="vc-spec">
            <span className="spec-icon"></span>
            <span>{seats} seats</span>
          </div>
          <div className="vc-spec">
            <span className="spec-icon">Gear:</span>
            <span>{transmission}</span>
          </div>
        </div>

        <div className="vc-footer">
          <div className="vc-price">
            <span className="price-amount">₹{pricePerDay}</span>
            <span className="price-unit"> / day</span>
          </div>
          <Link
            to={`/vehicles/${id}`}
            className={`btn btn-sm ${available ? 'btn-primary' : 'btn-ghost'}`}
            style={!available ? { pointerEvents: 'none' } : {}}
          >
            {available ? 'View Details →' : 'Unavailable'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
