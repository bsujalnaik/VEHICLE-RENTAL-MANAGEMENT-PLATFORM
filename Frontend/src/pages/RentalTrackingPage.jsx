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

  // Filter for the current user (if role is customer) or show all for admin/fleet demo
  const userBookings = bookings.filter(b => user.role === 'customer' ? b.userId === user.id : true);

  const handleExtend = async () => {
    if (!newEndDate || !selectedBooking) return;
    try {
      await api.extendBooking(selectedBooking.id, newEndDate);
      addToast(`Booking extended successfully to ${newEndDate}`, 'success');
      refreshBookings();
    } catch (err) {
      addToast(err.message || 'Failed to extend booking', 'error');
    } finally {
      setIsExtending(false);
      setSelectedBooking(null);
      setNewEndDate('');
    }
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
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '12px' }}>
                    <div><span style={{marginRight: '6px'}}>📍</span><strong>Location:</strong> {bk.location}</div>
                    {bk.fleetManagerName && bk.fleetManagerName !== "Not Assigned" && (
                      <div style={{ marginTop: '4px' }}><span style={{marginRight: '6px'}}>👤</span><strong>Manager:</strong> {bk.fleetManagerName}</div>
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

                {['Booked', 'Active'].includes(bk.status) && (
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
        onClose={() => setIsExtending(false)}
        title="Extend Rental"
      >
        {selectedBooking && selectedBooking.status !== 'Completed' ? (
          <div className="extend-modal-content">
            <p className="mb-16">Select a new return date for <strong>{selectedBooking.vehicleName}</strong>.</p>
            <div className="form-group mb-24">
              <label className="form-label">New Return Date</label>
              <input 
                type="date" 
                className="form-control"
                min={selectedBooking.endDate}
                value={newEndDate}
                onChange={e => setNewEndDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-8">
              <button className="btn btn-ghost" onClick={() => setIsExtending(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleExtend} disabled={!newEndDate}>Confirm Extension</button>
            </div>
          </div>
        ) : null}
      </Modal>

    </div>
  );
};

export default RentalTrackingPage;
