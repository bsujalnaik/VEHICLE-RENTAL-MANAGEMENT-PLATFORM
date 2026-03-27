import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';

const FleetAvailability = () => {
  const { vehicles: fleet, updateVehicle, addToast } = useApp();

  const toggleAvailability = async (id, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
    try {
      await updateVehicle(id, { status: newStatus });
      addToast(`Vehicle marked as ${newStatus}`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
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
                  <td className="font-semibold">{v.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{v.type}</td>
                  <td><StatusBadge status={v.status === 'available' ? 'Available' : v.status === 'maintenance' ? 'Maintenance' : 'Unavailable'} /></td>
                  <td>
                    <button 
                      className={`btn btn-sm ${v.status === 'available' ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggleAvailability(v.id, v.status)}
                    >
                      Set {v.status === 'available' ? 'Unavailable' : 'Available'}
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
