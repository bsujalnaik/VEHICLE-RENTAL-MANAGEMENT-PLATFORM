import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import { useState } from 'react';

const AdminBookings = () => {
  const { bookings, updateBookingStatus, addToast } = useApp();
  const [filter, setFilter] = useState('All');

  const handleStatusChange = (id, newStatus) => {
    updateBookingStatus(id, newStatus);
    addToast(`Booking #${id} status updated to ${newStatus}`, 'success');
  };

  const filteredBookings = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

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
            <option value="Active">Active</option>
            <option value="Booked">Booked</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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
                filteredBookings.map(bk => (
                  <tr key={bk.id}>
                    <td className="font-semibold text-gray-500">{bk.id}</td>
                    <td>{bk.userId}</td>
                    <td>
                      <div className="font-semibold text-gray-900">{bk.vehicleName}</div>
                    </td>
                    <td>
                      <div className="text-xs text-gray-500">
                        {new Date(bk.startDate).toLocaleDateString()} {'->'} {new Date(bk.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm font-semibold">{bk.totalDays} Days</div>
                    </td>
                    <td className="font-bold text-primary">₹{bk.totalPrice}</td>
                    <td>
                      <StatusBadge status={bk.status} />
                    </td>
                    <td>
                      <select 
                        className="form-control" 
                        style={{ width: '120px', padding: '6px' }}
                        value={bk.status}
                        onChange={(e) => handleStatusChange(bk.id, e.target.value)}
                      >
                        <option value="Booked">Booked</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
