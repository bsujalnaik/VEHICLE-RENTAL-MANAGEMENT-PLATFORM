import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Modal';

const AdminPricing = () => {
  const { pricingRules, addPricingRule, togglePricingRule, deletePricingRule, addToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Multiplier', value: 1.5, isActive: true });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this pricing rule?')) {
      deletePricingRule(id);
      addToast('Rule deleted', 'success');
    }
  };

  const handleCreate = () => {
    if (!form.name || !form.value) {
      addToast('Please fill all fields', 'error');
      return;
    }
    addPricingRule({ ...form, id: Date.now(), value: Number(form.value) });
    addToast('New pricing rule saved successfully', 'success');
    setIsModalOpen(false);
    setForm({ name: '', type: 'Multiplier', value: 1.5, isActive: true });
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
                <th>Value Effect</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pricingRules.map(r => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.name}</td>
                  <td className="text-gray-500">{r.type}</td>
                  <td className={r.value > 0 && r.type !== 'Discount %' ? 'text-danger font-bold' : 'text-success font-bold'}>
                    {r.type === 'Multiplier' ? `×${r.value}` : r.type === 'Flat' ? `₹${r.value}` : `-${r.value}%`}
                  </td>
                  <td>
                    <span className={`badge ${r.isActive ? 'badge-success' : 'badge-gray'}`}>
                      {r.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className={`btn btn-sm ${r.isActive ? 'btn-ghost' : 'btn-success'}`}
                        onClick={() => togglePricingRule(r.id)}
                      >
                        {r.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
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

      <div className="grid grid-2 gap-24">
        <div className="card p-24">
          <h3 className="section-title text-lg mb-16">Base Pricing Config</h3>
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

        <div className="card p-24" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)' }}>
          <h3 className="section-title text-lg mb-16 text-primary-dark">How Pricing Works</h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-16">
            Pricing is calculated dynamically based on:
          </p>
          <ul className="text-sm text-gray-700 font-semibold gap-8 flex-col" style={{ display: 'flex' }}>
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
              <option value="Multiplier">Multiplier</option>
              <option value="Flat">Flat Increase/Decrease</option>
              <option value="Discount %">Discount %</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Effect Value</label>
            <input type="number" className="form-control" placeholder="e.g. 1.5, -20, 10" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
          </div>
        </div>
        <p className="form-hint mb-24 text-gray-500">
          * Use decimals for multipliers (e.g. 1.2), use native numbers directly for flat discounts (e.g. -20).
        </p>
        <div className="flex justify-end gap-8">
          <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate}>Save Pricing Rule</button>
        </div>
      </Modal>

    </div>
  );
};

export default AdminPricing;
