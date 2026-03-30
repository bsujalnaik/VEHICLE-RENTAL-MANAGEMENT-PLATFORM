import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Modal';

const AdminPricing = () => {
  const { pricingRules, addPricingRule, togglePricingRule, deletePricingRule, addToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'seasonal', value: 1.5, isActive: true });

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deletePricingRule(deleteConfirmId);
      addToast('Rule deleted', 'success');
      setDeleteConfirmId(null);
    } catch (err) {
      addToast(err.message || 'Failed to delete rule', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleToggle = async (id) => {
    try {
      await togglePricingRule(id);
      addToast('Rule toggled', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to toggle rule', 'error');
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.value) {
      addToast('Please fill all fields', 'error');
      return;
    }
    try {
      await addPricingRule({ ...form, value: Number(form.value) });
      addToast('New pricing rule saved successfully', 'success');
      setIsModalOpen(false);
      setForm({ name: '', type: 'seasonal', value: 1.5, isActive: true });
    } catch (err) {
      addToast(err.message || 'Failed to create rule', 'error');
    }
  };

  return (
    <div className="admin-pricing">
      <div className="page-header flex-between mb-24">
        <div>
          <h2>Pricing Rules</h2>
          <p>Configure dynamic pricing rules, discounts, and multipliers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Create Rule
        </button>
      </div>

      <div className="card mb-32">
        <div className="card-header">
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Active Global Rules</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Rule Type</th>
                <th>Multiplier</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pricingRules.map(r => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.name}</td>
                  <td className="text-gray-500" style={{ textTransform: 'capitalize' }}>{r.type}</td>
                  <td className="font-bold">×{r.value || r.multiplier}</td>
                  <td>
                    <span className={`badge ${r.isActive ? 'badge-success' : 'badge-gray'}`}>
                      {r.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className={`btn btn-sm ${r.isActive ? 'btn-ghost' : 'btn-success'}`}
                        onClick={() => handleToggle(r.id)}
                      >
                        {r.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {pricingRules.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-24 text-gray-400">No pricing rules defined.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '24px', marginTop: '48px' }}>
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', letterSpacing: '-0.02em', color: 'var(--color-primary)' }}>Base Pricing Config</h3>
          <p className="text-sm text-gray-500 mb-24">
            Adjust global base pricing parameters for the entire platform. This affects minimum daily prices.
          </p>
          <div className="form-group mb-16">
            <label className="form-label">Minimum Daily Rate (₹)</label>
            <input type="number" className="form-control" defaultValue={40} />
          </div>
          <div className="form-group mb-24">
            <label className="form-label">Insurance Premium Base (%)</label>
            <input type="number" className="form-control" defaultValue={10} />
          </div>
          <button className="btn btn-primary btn-full" onClick={() => addToast('Base settings saved', 'success')}>
            Save Settings
          </button>
        </div>

        <div className="card" style={{ padding: '32px', background: 'transparent', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', letterSpacing: '-0.02em' }}>How Pricing Works</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-16">
            Pricing is calculated dynamically based on:
          </p>
          <ul className="text-sm font-semibold" style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--color-text)' }}>
            <li>1. Base daily rate of the vehicle</li>
            <li>2. Duration entered by the user</li>
            <li>3. Any active multiplier rules</li>
            <li>4. Applied bulk discount rules</li>
          </ul>
        </div>
      </div>

      {/* Adding Pricing Rule Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Rule">
        <div className="form-group mb-16">
          <label className="form-label">Rule Name</label>
          <input type="text" className="form-control" placeholder="e.g. Summer Special" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="grid grid-2 mb-16">
          <div className="form-group">
            <label className="form-label">Rule Type</label>
            <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="seasonal">Seasonal</option>
              <option value="weekend">Weekend</option>
              <option value="late">Late Fee</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Multiplier Value</label>
            <input type="number" step="0.05" className="form-control" placeholder="e.g. 1.5" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
          </div>
        </div>
        <p className="form-hint mb-24 text-gray-500">
          * Use decimals for multipliers (e.g. 1.2 = 20% more, 0.8 = 20% discount).
        </p>
        <div className="flex justify-end gap-8">
          <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate}>Save Pricing Rule</button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Deletion" size="sm">
        <div className="flex-col gap-16">
          <p className="text-gray-400">
            Are you sure you want to delete this pricing rule? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-12 mt-24">
            <button className="btn btn-ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={executeDelete}>Delete Rule</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPricing;
