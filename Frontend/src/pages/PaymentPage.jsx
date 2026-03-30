import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import './PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user, addToast, addBooking } = useApp();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const data = sessionStorage.getItem('pendingBooking');
    if (!data) {
      navigate('/vehicles');
      return;
    }
    setBooking(JSON.parse(data));
  }, [user, navigate]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (method === 'card') {
      if (!card.number || !card.expiry || !card.cvc || !card.name) {
        addToast('Please fill all card details', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Create booking in Backend
      const completedBooking = await api.createBooking({ 
        vehicleId: booking.vehicleId, 
        startDate: booking.startDate, 
        endDate: booking.endDate 
      });
      
      // 2. Process payment with real booking ID
      await api.processPayment({ bookingId: completedBooking.id, method, amount: booking.totalPrice });
      
      addBooking(completedBooking);
      sessionStorage.removeItem('pendingBooking');
      setIsSuccess(true);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pay-page page-content flex-center" style={{ minHeight: '80vh' }}>
        <div className="card text-center" style={{ maxWidth: 460, width: '100%', padding: '48px 32px' }}>
          <div className="flex-center mb-24">
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          <h2 className="mb-16" style={{ fontSize: '1.75rem' }}>Payment Successful</h2>
          <p className="text-gray-400 mb-32">
            Your payment for the <strong>{booking?.vehicleName}</strong> has been securely processed and your trip is locked in. 
          </p>
          <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/rentals')}>
            Go to My Rentals
          </button>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="pay-page page-content">
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="section-title text-center mb-8">Secure Payment</h1>
        <p className="section-subtitle text-center mb-32">Complete your booking securely via our payment gateway</p>

        <div className="pay-layout">
          {/* Summary */}
          <div className="pay-summary card">
            <div className="card-header">
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Booking Summary</h3>
            </div>
            <div className="card-body">
              <div className="pay-vehicle-summary">
                <img src={booking.vehicleImage} alt="Vehicle" />
                <div>
                  <h4>{booking.vehicleName}</h4>
                  <p>{booking.totalDays} Days Rental</p>
                </div>
              </div>
              
              <div className="divider" />
              
              <div className="pay-row">
                <span>Start Date</span>
                <span>{new Date(booking.startDate).toLocaleDateString()}</span>
              </div>
              <div className="pay-row mt-8">
                <span>End Date</span>
                <span>{new Date(booking.endDate).toLocaleDateString()}</span>
              </div>
              
              <div className="divider" />
              
              <div className="pay-total">
                <span>Total Amount</span>
                <span className="text-primary font-bold text-xl">₹{booking.totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form className="pay-form card" onSubmit={handlePay}>
            <div className="card-header">
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Payment Method</h3>
            </div>
            <div className="card-body">
              <div className="pay-methods">
                <button type="button" className={`pm-btn ${method === 'card' ? 'active' : ''}`} onClick={() => setMethod('card')}> Card</button>
                <button type="button" className={`pm-btn ${method === 'upi' ? 'active' : ''}`} onClick={() => setMethod('upi')}> UPI</button>
                <button type="button" className={`pm-btn ${method === 'netbanking' ? 'active' : ''}`} onClick={() => setMethod('netbanking')}> Bank</button>
              </div>

              {method === 'card' && (
                <div className="card-details-form">
                  <div className="form-group mb-16">
                    <label className="form-label">Cardholder Name</label>
                    <input type="text" className="form-control" placeholder="John Doe" value={card.name} onChange={e => setCard({...card, name: e.target.value})} required />
                  </div>
                  <div className="form-group mb-16">
                    <label className="form-label">Card Number</label>
                    <input type="text" className="form-control" placeholder="0000 0000 0000 0000" maxLength="19" value={card.number} onChange={e => setCard({...card, number: e.target.value})} required />
                  </div>
                  <div className="grid grid-2 mb-16">
                    <div className="form-group">
                      <label className="form-label">Expiry (MM/YY)</label>
                      <input type="text" className="form-control" placeholder="MM/YY" maxLength="5" value={card.expiry} onChange={e => setCard({...card, expiry: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVC</label>
                      <input type="password" className="form-control" placeholder="•••" maxLength="4" value={card.cvc} onChange={e => setCard({...card, cvc: e.target.value})} required />
                    </div>
                  </div>
                </div>
              )}

              {method === 'upi' && (
                <div className="form-group mt-16 mb-16">
                  <label className="form-label">UPI ID</label>
                  <input type="text" className="form-control" placeholder="username@upi" required />
                  <p className="form-hint mt-8 text-center text-success">Or scan QR code below</p>
                  <div className="upi-qr flex-center mt-8">
                    <div style={{ width: 150, height: 150, background: 'var(--gray-200)', borderRadius: 8 }} />
                  </div>
                </div>
              )}

              {method === 'netbanking' && (
                <div className="form-group mt-16 mb-16">
                  <label className="form-label">Select Bank</label>
                  <select className="form-control" required>
                    <option value="">Select your bank...</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full btn-lg mt-8" disabled={loading}>
                {loading ? 'Processing...' : `Pay ₹${booking.totalPrice} Now`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
