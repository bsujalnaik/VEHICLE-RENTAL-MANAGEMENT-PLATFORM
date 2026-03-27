import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';

const FleetStatus = () => {
  const { vehicles: fleet } = useApp();

  return (
    <div className="fleet-status">
      <div className="page-header mb-24">
        <h2>Live Vehicle Status</h2>
        <p>Monitor physical location and conditions of the fleet.</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Vehicle Model</th>
                <th>Fuel Type</th>
                <th>Seats</th>
                <th>Current Condition</th>
              </tr>
            </thead>
            <tbody>
              {fleet.map(v => (
                <tr key={v.id}>
                  <td className="font-mono text-gray-500 font-semibold">{v.registration}</td>
                  <td className="font-semibold">{v.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{v.fuel}</td>
                  <td>{v.seats}</td>
                  <td>
                    <StatusBadge status={v.status === 'available' ? 'Available' : v.status === 'maintenance' ? 'Maintenance' : 'Unavailable'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FleetStatus;
