import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import { useState } from 'react';

const AdminBookings = () => {
  const { bookings, vehicles, updateBookingStatus, addToast } = useApp();
  const [filter, setFilter] = useState('All');

  const handleStatusChange = (id, newStatus) => {
    updateBookingStatus(id, newStatus);
    addToast(`Booking #${id} status updated to ${newStatus}`, 'success');
  };

  const filteredBookings = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  // Helper to compute days between two dates
  const calcDays = (start, end) => {
    if (!start || !end) return '—';
    const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  return (
    <div className="admin-bookings">
      <div className="page-header flex-between mb-24">
        <div>
          <h2>All Bookings</h2>
          <p>Monitor and manage all customer rentals.</p>
        </div>
        
        <div className="filter-group">
          <label className="text-sm font-semibold text-gray-500 mr-8">Filter Status:</label>
          <select 
            className="form-control" 
            style={{ width: 'auto', display: 'inline-block' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Bookings</option>
            <option value="BOOKED">Booked</option>
            <option value="PAID">Paid</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="RETURNED">Returned</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User / Customer</th>
                <th>Vehicle Info</th>
                <th>Duration</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-24 text-gray-500">No bookings found for the selected filter.</td>
                </tr>
              ) : (
                filteredBookings.map(bk => {
                  const vehicle = vehicles.find(v => v.id === bk.vehicleId);
                  const vehicleName = vehicle ? vehicle.name : `Vehicle #${bk.vehicleId}`;
                  const totalDays = calcDays(bk.startDate, bk.endDate);
                  return (
                    <tr key={bk.id}>
                      <td className="font-semibold text-gray-500">{bk.id}</td>
                      <td>User #{bk.userId}</td>
                      <td>
                        <div className="font-semibold text-gray-900">{vehicleName}</div>
                      </td>
                      <td>
                        <div className="text-xs text-gray-500">
                          {new Date(bk.startDate).toLocaleDateString()} {'->'} {new Date(bk.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-semibold">{totalDays} Days</div>
                      </td>
                      <td className="font-bold text-primary">₹{bk.totalPrice}</td>
                      <td>
                        <StatusBadge status={bk.status} />
                      </td>
                      <td>
                        <select 
                          className="form-control" 
                          style={{ width: '130px', padding: '6px' }}
                          value={bk.status}
                          onChange={(e) => handleStatusChange(bk.id, e.target.value)}
                        >
                          <option value="BOOKED">Booked</option>
                          <option value="PAID">Paid</option>
                          <option value="PICKED_UP">Picked Up</option>
                          <option value="RETURNED">Returned</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
