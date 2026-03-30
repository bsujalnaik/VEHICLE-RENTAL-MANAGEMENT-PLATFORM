import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import './BookingPage.css';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addToast, vehicles } = useApp();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState(0);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  useEffect(() => {
    if (!user) {
      addToast('Please sign in to book a vehicle', 'warning');
      navigate('/login', { state: { from: `/book/${id}` } });
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      const data = vehicles.find(x => x.id === parseInt(id) || String(x.id) === id);
      if (!data || data.status !== 'available') {
        addToast(data ? 'Vehicle is not available' : 'Vehicle not found', 'error');
        navigate('/vehicles');
      } else {
        setVehicle(data);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [id, user, navigate, addToast, vehicles]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const calcDays = diffDays > 0 ? diffDays : Number(startDate !== endDate ? 1 : 0);
      setDays(calcDays);

      if (vehicle && start <= end) {
        api.estimateBooking({ vehicleId: vehicle.id, startDate, endDate })
          .then(data => setEstimatedPrice(data.estimate))
          .catch(console.error);
      }
    } else {
      setDays(0);
      setEstimatedPrice(0);
    }
  }, [startDate, endDate, vehicle]);

  const handleBook = () => {
    if (!startDate || !endDate) {
      addToast('Please select pickup and return dates', 'warning');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      addToast('Return date must be after pickup date', 'error');
      return;
    }

    // Save booking data to session to pass to payment page
    const bookingData = {
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.brand} ${vehicle.name}`,
      vehicleImage: vehicle.image,
      startDate,
      endDate,
      totalDays: days,
      totalPrice: estimatedPrice || days * vehicle.pricePerDay,
      userId: user.id
    };
    
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    navigate('/payment');
  };

  if (loading) return <div className="page-content flex-center"><div className="spinner" /></div>;
  if (!vehicle) return null;

  return (
    <div className="bk-page page-content">
      <div className="container">
        <div className="bk-layout">
          {/* Booking Form */}
          <div className="bk-form-area card">
            <div className="card-header">
              <h2 className="section-title">Schedule Your Rental</h2>
              <p className="section-subtitle mb-0">Select your dates to calculate the final price</p>
            </div>
            <div className="card-body">
              <div className="grid grid-2 mb-24">
                <div className="form-group">
                  <label className="form-label">Pickup Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Return Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Renter Details (Readonly) */}
              <div className="renter-details">
                <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Renter Details</h3>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" value={user.name} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={user.email} disabled />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bk-summary sticky-col">
            <div className="card">
              <div className="bk-summary-img">
                <img src={vehicle.image} alt={vehicle.name} />
              </div>
              <div className="card-body">
                <h3 className="bk-vehicle-name">{vehicle.brand} {vehicle.name}</h3>
                <div className="bk-vehicle-type">{vehicle.type} • {vehicle.transmission}</div>
                
                {vehicle.location && (
                  <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--color-text-soft)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ color: 'var(--color-muted)', flexShrink: 0 }}><circle cx="7" cy="5.5" r="2.5"/><path d="M7 13C7 13 2 8.5 2 5.5a5 5 0 0110 0C12 8.5 7 13 7 13z"/></svg>
                      <strong>Pickup:</strong> {vehicle.location}
                    </div>
                    {vehicle.fleetManagerName && vehicle.fleetManagerName !== "Not Assigned" && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ color: 'var(--color-muted)', flexShrink: 0 }}><circle cx="7" cy="5" r="3"/><path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg>
                        <strong>Manager:</strong> {vehicle.fleetManagerName}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="divider" />
                
                <div className="bk-breakdown">
                  <div className="bk-row">
                    <span>Rate</span>
                    <span>₹{vehicle.pricePerDay} / day</span>
                  </div>
                  <div className="bk-row">
                    <span>Duration</span>
                    <span>{days} {days === 1 ? 'day' : 'days'}</span>
                  </div>
                  {days > 0 && (
                    <div className="bk-row text-success">
                      <span>Subtotal</span>
                      <span>₹{estimatedPrice || days * vehicle.pricePerDay}</span>
                    </div>
                  )}
                </div>

                <div className="divider" />
                
                <div className="bk-total">
                  <span>Total Price</span>
                  <span className="bk-total-price">₹{estimatedPrice || days * vehicle.pricePerDay}</span>
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg mt-24"
                  onClick={handleBook}
                  disabled={days === 0}
                >
                  Proceed to Payment →
                </button>
                
                <p className="form-hint text-center mt-12 mb-0">
                  You won't be charged yet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
