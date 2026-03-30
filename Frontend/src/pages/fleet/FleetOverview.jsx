import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';

const FleetOverview = () => {
  const { vehicles: fleet, maintenanceLogs, bookings } = useApp();

  const availableCount = fleet.filter(v => v.status === 'available').length;
  const pendingMaintenance = maintenanceLogs.filter(l => l.status === 'Pending').length;
  
  // Filter active bookings (Booked, Paid, Picked Up) to show upcoming returns
  const activeBookings = bookings.filter(b => ['BOOKED', 'PAID', 'PICKED_UP', 'Booked', 'Paid', 'Picked Up'].includes(b.status));

  const IconCar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="10" width="18" height="8" rx="2" ry="2" /><path d="M5 10l2-4h10l2 4" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>;
  const IconKey = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M11.5 11.5L21 2v4l-3 3v3l-3 3"/></svg>;
  const IconWrench = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;

  return (
    <div className="fleet-overview">
      <div className="page-header mb-24">
        <h1>Fleet Overview</h1>
        <p>A quick summary of fleet metrics and active maintenance issues.</p>
      </div>

      <div className="grid grid-3 mb-32">
        <div className="stat-card">
          <div className="stat-icon gold">
            <IconCar />
          </div>
          <div className="stat-info">
            <div className="stat-value">{fleet.length}</div>
            <div className="stat-label">Total Vehicles</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">
            <IconKey />
          </div>
          <div className="stat-info">
            <div className="stat-value">{availableCount}</div>
            <div className="stat-label">Available Now</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">
            <IconWrench />
          </div>
          <div className="stat-info">
            <div className="stat-value">{pendingMaintenance}</div>
            <div className="stat-label">Maintenance Pending</div>
          </div>
        </div>
      </div>

      <div className="card mb-32">
        <div className="card-header">
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Active Bookings & Expected Returns</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Vehicle</th>
                <th>Start Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeBookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-24 text-gray-400">No active bookings for your fleet.</td>
                </tr>
              ) : (
                activeBookings.map(bk => {
                  const vehicleName = fleet.find(v => v.id === bk.vehicleId)?.name || `Vehicle #${bk.vehicleId}`;
                  return (
                    <tr key={bk.id}>
                      <td className="font-semibold text-gray-500">#{bk.id}</td>
                      <td className="font-semibold">{vehicleName}</td>
                      <td className="text-gray-500">{new Date(bk.startDate).toLocaleDateString()}</td>
                      <td className="text-primary font-bold">{new Date(bk.endDate).toLocaleDateString()}</td>
                      <td><StatusBadge status={bk.status} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Recent Maintenance Logs</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Date</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-24 text-gray-400">No maintenance logs found.</td>
                </tr>
              ) : (
                maintenanceLogs.map(log => {
                  return (
                    <tr key={log.id}>
                      <td className="font-semibold">Vehicle #{log.vehicle_id || log.vehicleId}</td>
                      <td>{log.type}</td>
                      <td className="text-gray-500">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="text-sm text-gray-500">{log.description || log.notes || '—'}</td>
                      <td><StatusBadge status={log.status} /></td>
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

export default FleetOverview;
