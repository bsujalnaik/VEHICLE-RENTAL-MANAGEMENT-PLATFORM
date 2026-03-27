import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';

const FleetAvailability = () => {
  const { vehicles: fleet, updateVehicle, addToast } = useApp();

  const toggleAvailability = async (id, currentStatus) => {
    try {
      updateVehicle(id, { available: !currentStatus });
      addToast(`Vehicle marked as ${!currentStatus ? 'available' : 'unavailable'}`, 'success');
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="fleet-availability">
      <div className="page-header mb-24">
        <h2>Vehicle Availability</h2>
        <p>Manually toggle vehicle routing availability for bookings.</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle Name</th>
                <th>Category</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fleet.map(v => (
                <tr key={v.id}>
                  <td className="font-semibold">{v.brand} {v.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{v.type}</td>
                  <td><StatusBadge status={v.available ? 'Available' : 'Unavailable'} /></td>
                  <td>
                    <button 
                      className={`btn btn-sm ${v.available ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggleAvailability(v.id, v.available)}
                    >
                      Set {v.available ? 'Unavailable' : 'Available'}
                    </button>
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

export default FleetAvailability;
