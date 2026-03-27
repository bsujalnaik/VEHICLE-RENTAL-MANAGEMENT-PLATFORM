import { useState } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

const FleetMaintenance = () => {
  const { vehicles, maintenanceLogs, addMaintenanceLog, updateMaintenanceLog, addToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [form, setForm] = useState({ vehicleId: '', type: '', notes: '' });

  const handleResolve = async (id) => {
    try {
      await updateMaintenanceLog(id, { status: 'Completed' });
      addToast('Maintenance task marked as completed', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to complete maintenance', 'error');
    }
  };

  const handleCreate = async () => {
    if (!form.vehicleId || !form.type) {
      addToast('Please select a vehicle and service type', 'error');
      return;
    }
    
    try {
      await addMaintenanceLog({
        vehicleId: Number(form.vehicleId),
        type: form.type,
        notes: form.notes,
        description: form.notes,
      });
      
      addToast('Maintenance task logged successfully', 'success');
      setIsModalOpen(false);
      setForm({ vehicleId: '', type: '', notes: '' });
    } catch (err) {
      addToast(err.message || 'Failed to log maintenance', 'error');
    }
  };

  return (
    <div className="fleet-maintenance">
      <div className="page-header flex-between mb-24">
        <div>
          <h2>Service & Maintenance</h2>
          <p>Schedule and sign off on vehicle maintenance tasks.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Log Maintenance
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Scheduled Date</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceLogs.map(log => (
                <tr key={log.id}>
                  <td className="font-mono text-gray-500">MNT-{String(log.id).padStart(4, '0')}</td>
                  <td className="font-semibold">Vehicle #{log.vehicle_id || log.vehicleId}</td>
                  <td>{log.type}</td>
                  <td>{new Date(log.date).toLocaleDateString()}</td>
                  <td className="text-sm text-gray-500" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.description || log.notes || '—'}</td>
                  <td><StatusBadge status={log.status} /></td>
                  <td>
                    {log.status === 'Pending' ? (
                      <button className="btn btn-success btn-sm" onClick={() => handleResolve(log.id)}>
                        Mark Done
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
              {maintenanceLogs.length === 0 && (
                <tr><td colSpan="7" className="text-center p-24 text-gray-400">No maintenance logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Maintenance">
        <div className="form-group mb-16">
          <label className="form-label">Select Vehicle</label>
          <select className="form-control" value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})}>
            <option value="">-- Choose a vehicle --</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group mb-16">
          <label className="form-label">Service Type</label>
          <input type="text" className="form-control" placeholder="e.g. Oil Change, Brake Inspection" value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
        </div>
        <div className="form-group mb-16">
          <label className="form-label">Technician Notes</label>
          <textarea className="form-control" rows="3" placeholder="Additional details..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}></textarea>
        </div>
        <div className="flex justify-end gap-8 mt-24">
          <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate}>Save Log</button>
        </div>
      </Modal>

    </div>
  );
};

export default FleetMaintenance;
