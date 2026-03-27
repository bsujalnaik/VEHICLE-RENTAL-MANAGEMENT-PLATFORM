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
                <th>Odometer Reading</th>
                <th>Fuel/Battery Level</th>
                <th>Current Condition</th>
              </tr>
            </thead>
            <tbody>
              {fleet.map(v => (
                <tr key={v.id}>
                  <td className="font-mono text-gray-500 font-semibold">MH-02-{v.id.toString().padStart(4, '0')}</td>
                  <td className="font-semibold">{v.brand} {v.name}</td>
                  <td>{Math.floor(Math.random() * 50000 + 5000).toLocaleString()} km</td>
                  <td>
                    <div className="flex items-center gap-8">
                      <div className="progress-bar w-full" style={{ width: '60px', background: 'var(--gray-200)' }}>
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${Math.floor(Math.random() * 60 + 40)}%`, 
                            background: v.fuel.toLowerCase() === 'electric' ? 'var(--info)' : 'var(--success)' 
                          }} 
                        />
                      </div>
                      <span className="text-xs text-gray-500">{v.fuel === 'Electric' ? 'Charge' : 'Tank'}</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={v.available ? 'Available' : 'Maintenance'} />
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
