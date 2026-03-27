import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';

const FleetOverview = () => {
  const { vehicles: fleet, maintenanceLogs } = useApp();


  return (
    <div className="fleet-overview">
      <div className="page-header mb-24">
        <h1>Fleet Overview</h1>
        <p>A quick summary of fleet metrics and active maintenance issues.</p>
      </div>

      <div className="grid grid-3 mb-32">
        <div className="stat-card">
          <div className="stat-icon blue">
            <img src="https://images.unsplash.com/photo-1494913148647-353ae514b35e?w=100&q=80" alt="Fleet" style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{fleet.length}</div>
            <div className="stat-label">Total Vehicles</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <img src="https://images.unsplash.com/photo-1549416878-b9ca35c2d47b?w=100&q=80" alt="Available" style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{fleet.filter(v => v.available).length}</div>
            <div className="stat-label">Available Now</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">
            <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&q=80" alt="Logs" style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{maintenanceLogs.filter(l => l.status === 'Pending').length}</div>
            <div className="stat-label">Maintenance Pending</div>
          </div>
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
                <th>Technician</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceLogs.map(log => (
                <tr key={log.id}>
                  <td className="font-semibold">{log.vehicleName}</td>
                  <td>{log.type}</td>
                  <td className="text-gray-500">{new Date(log.date).toLocaleDateString()}</td>
                  <td>{log.technician}</td>
                  <td><StatusBadge status={log.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FleetOverview;
