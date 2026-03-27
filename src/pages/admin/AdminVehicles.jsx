import { useState } from 'react';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { useApp } from '../../context/AppContext';

const AdminVehicles = () => {
  const { vehicles, addVehicle, deleteVehicle, addToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', brand: '', type: 'car', pricePerDay: 50, pricePerHour: 10,
    fuel: 'Petrol', seats: 4, mileage: '15 km/l', transmission: 'Manual',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&q=80',
    available: true, rating: 4.5, reviews: 0, description: 'Added by Admin', features: []
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this vehicle?')) {
      deleteVehicle(id);
      addToast('Vehicle removed successfully', 'success');
    }
  };

  const handleAdd = () => {
    if (!formData.name || !formData.brand || !formData.pricePerDay) {
      addToast('Please fill all required fields', 'error');
      return;
    }
    
    // Add missing derived fields before saving
    addVehicle({ ...formData, pricePerDay: Number(formData.pricePerDay), pricePerHour: Number(formData.pricePerHour) });
    addToast('New vehicle added to the fleet!', 'success');
    setIsModalOpen(false);
  };

  return (
    <div className="admin-vehicles">
      <div className="page-header flex-between mb-24">
        <div>
          <h2>Manage Vehicles</h2>
          <p>Add, edit, or remove vehicles from the fleet.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Add Vehicle
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Brand</th>
                <th>Type</th>
                <th>Price/Day</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td className="font-semibold">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={v.image} alt={v.name} style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px', background: '#eee' }} />
                      {v.name}
                    </div>
                  </td>
                  <td>{v.brand}</td>
                  <td style={{ textTransform: 'capitalize' }}>{v.type}</td>
                  <td className="font-bold text-primary">₹{v.pricePerDay}</td>
                  <td><StatusBadge status={v.available ? 'Available' : 'Unavailable'} /></td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => addToast('Edit coming soon', 'info')}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vehicle">
        <div className="form-group mb-16">
          <label className="form-label">Vehicle Name</label>
          <input type="text" className="form-control" placeholder="e.g. Model S" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="form-group mb-16">
          <label className="form-label">Brand</label>
          <input type="text" className="form-control" placeholder="e.g. Tesla" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
        </div>
        <div className="grid grid-2 mb-16">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="van">Van</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Price per Day (₹)</label>
            <input type="number" className="form-control" value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: e.target.value})} />
          </div>
        </div>
        <div className="flex justify-end gap-8 mt-24">
          <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd}>Save Vehicle</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminVehicles;
