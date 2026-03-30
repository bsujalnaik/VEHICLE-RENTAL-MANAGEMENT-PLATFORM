import { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import './RentalTrackingPage.css';
import { api } from '../services/api';

const RentalTrackingPage = () => {
  const { user, bookings, addToast, refreshBookings } = useApp();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isExtending, setIsExtending] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');
  const [extendStep, setExtendStep] = useState(1);
  const [extraCost, setExtraCost] = useState(0);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [processingExtension, setProcessingExtension] = useState(false);

  // Filter for the current user and aggressively sort latest first
  const userBookings = bookings
    .filter(b => user.role === 'customer' ? b.userId === user.id : true)
    .sort((a, b) => b.id - a.id);

  const resetExtensionModal = () => {
    setIsExtending(false);
    setSelectedBooking(null);
    setNewEndDate('');
    setExtendStep(1);
    setExtraCost(0);
    setCardDetails({ number: '', expiry: '', cvc: '' });
    setProcessingExtension(false);
  };

  const handleCalculateExtension = async () => {
    if (!newEndDate || !selectedBooking) return;
    try {
      setProcessingExtension(true);
      const estimate = await api.estimateBooking({
        vehicleId: selectedBooking.vehicleId,
        startDate: selectedBooking.startDate,
        endDate: newEndDate
      });
      
      const diff = estimate.estimate - selectedBooking.totalPrice;
      if (diff <= 0) {
        addToast('Invalid duration selected', 'error');
        setProcessingExtension(false);
        return;
      }
      
      setExtraCost(diff);
      setExtendStep(2);
    } catch (err) {
      addToast(err.message || 'Failed to estimate cost', 'error');
    } finally {
      setProcessingExtension(false);
    }
  };

  const handleExecutePayment = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
      addToast('Please fill all payment fields to complete extension', 'error');
      return;
    }
    
    setProcessingExtension(true);
    try {
      await api.extendBooking(selectedBooking.id, newEndDate);
      refreshBookings();
      setExtendStep(3); // Show success screen
    } catch (err) {
      addToast(err.message || 'Failed to process extension', 'error');
    } finally {
      setProcessingExtension(false);
    }
  };

  const getMinExtensionDate = (dateStr) => {
    if (!dateStr) return '';
    const dt = new Date(dateStr);
    dt.setDate(dt.getDate() + 1); // Extension must be at least the next day
    return dt.toLocaleDateString('en-CA'); // Gets YYYY-MM-DD perfectly
  };

  const getStatusMessage = (status) => {
    switch(status) {
      case 'Booked': return 'Your vehicle is ready for pickup.';
      case 'Active': return 'You are currently on your trip. Drive safely.';
      case 'Completed': return 'This trip has been completed.';
      case 'Cancelled': return 'This booking was cancelled.';
      default: return '';
    }
  };

  if (!userBookings.length) {
    return (
      <div className="rt-page page-content flex-center">
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h3>No Rentals Yet</h3>
          <p>You haven't booked any vehicles yet. Ready for your first trip?</p>
          <a href="/vehicles" className="btn btn-primary mt-16">Browse Vehicles</a>
        </div>
      </div>
    );
  }

  return (
    <div className="rt-page page-content">
      <div className="container">
        <div className="page-header">
          <h1>My Rentals</h1>
          <p>Track your current trips and view past bookings.</p>
        </div>

        <div className="rt-list">
          {userBookings.map(bk => (
            <div key={bk.id} className="rt-card card">
              <div className="rt-card-img">
                <img src={bk.vehicleImage} alt={bk.vehicleName} />
              </div>
              
              <div className="rt-card-body">
                <div className="flex-between mb-8">
                  <span className="rt-booking-id">Booking #{bk.id}</span>
                  <StatusBadge status={bk.status} />
                </div>
                
                <h3 className="rt-vehicle-name">{bk.vehicleName}</h3>
                
                {bk.location && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="5.5" r="2.5"/><path d="M7 13C7 13 2 8.5 2 5.5a5 5 0 0110 0C12 8.5 7 13 7 13z"/></svg>
                      <strong>Location:</strong> {bk.location}
                    </div>
                    {bk.fleetManagerName && bk.fleetManagerName !== "Not Assigned" && (
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="5" r="3"/><path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg>
                        <strong>Manager:</strong> {bk.fleetManagerName}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="rt-details">
                  <div className="rt-detail-item">
                    <span className="rt-lbl">Pickup</span>
                    <span className="rt-val">{new Date(bk.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="rt-detail-item">
                    <span className="rt-lbl">Return</span>
                    <span className="rt-val">{new Date(bk.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="rt-detail-item">
                    <span className="rt-lbl">Total Cost</span>
                    <span className="rt-val text-primary font-bold">₹{bk.totalPrice}</span>
                  </div>
                </div>

                <div className="rt-status-msg">
                  {getStatusMessage(bk.status)}
                </div>

                {['Booked', 'Paid', 'Active'].includes(bk.status) && new Date() <= new Date(new Date(bk.endDate).getTime() + 86400000) && (
                  <div className="rt-actions mt-16 flex justify-end gap-8">
                    <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedBooking(bk); setIsExtending(true); }}>Extend</button>

                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isExtending}
        onClose={resetExtensionModal}
        title="Extend Rental"
      >
        {selectedBooking && selectedBooking.status !== 'Completed' ? (
          <div className="extend-modal-content">
            {extendStep === 1 ? (
              <>
                <p className="mb-16">Select a new return date for <strong>{selectedBooking.vehicleName}</strong>.</p>
                <div className="form-group mb-24">
                  <label className="form-label">New Return Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    min={getMinExtensionDate(selectedBooking.endDate)}
                    value={newEndDate}
                    onChange={e => setNewEndDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-8">
                  <button className="btn btn-ghost" onClick={resetExtensionModal}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleCalculateExtension} disabled={!newEndDate || processingExtension}>
                    {processingExtension ? 'Calculating...' : 'Calculate Extension'}
                  </button>
                </div>
              </>
            ) : extendStep === 2 ? (
              <div className="pay-modal-step">
                <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)', display: 'block', marginBottom: '4px' }}>Additional Cost</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>₹{extraCost}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)', display: 'block', marginBottom: '4px' }}>New Return Date</span>
                    <strong style={{ fontSize: '1rem' }}>{new Date(newEndDate).toLocaleDateString()}</strong>
                  </div>
                </div>

                <div className="form-group mb-16">
                  <label className="form-label">Card Number</label>
                  <input type="text" className="form-control" placeholder="0000 0000 0000 0000" maxLength="19" value={cardDetails.number} onChange={e => setCardDetails(f => ({...f, number: e.target.value}))} />
                </div>
                <div className="grid grid-2 mb-24">
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input type="text" className="form-control" placeholder="MM/YY" maxLength="5" value={cardDetails.expiry} onChange={e => setCardDetails(f => ({...f, expiry: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVC</label>
                    <input type="password" className="form-control" placeholder="•••" maxLength="4" value={cardDetails.cvc} onChange={e => setCardDetails(f => ({...f, cvc: e.target.value}))} />
                  </div>
                </div>
                
                <div className="flex justify-end gap-8">
                  <button className="btn btn-ghost" onClick={() => setExtendStep(1)} disabled={processingExtension}>Back</button>
                  <button className="btn btn-primary" onClick={handleExecutePayment} disabled={processingExtension}>
                    {processingExtension ? 'Processing...' : `Pay ₹${extraCost} Securely`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pay-modal-step text-center">
                <div className="flex-center mb-24 mt-16">
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                </div>
                <h2 className="mb-16" style={{ fontSize: '1.75rem' }}>Extension Successful</h2>
                <p className="text-gray-400 mb-32">
                  Your payment of <strong>₹{extraCost}</strong> was processed. Your rental is securely extended to {new Date(newEndDate).toLocaleDateString()}.
                </p>
                <button className="btn btn-primary btn-full btn-lg" onClick={resetExtensionModal}>
                  Done
                </button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

    </div>
  );
};

export default RentalTrackingPage;
