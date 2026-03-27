import { useState, useRef } from 'react';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

const AdminVehicles = () => {
  const { vehicles, addVehicle, deleteVehicle, addToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    brand: '', model: '', type: 'car', pricePerDay: 50, pricePerHour: 10,
    fuel: 'petrol', seats: 4, registration: '',
    image: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      addToast('Please select a valid image file (PNG, JPG, GIF, WebP)', 'error');
      return;
    }
    
    // Validate file size (max 16MB)
    if (file.size > 16 * 1024 * 1024) {
      addToast('Image file is too large. Max size is 16MB.', 'error');
      return;
    }
    
    setSelectedFile(file);
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to remove this vehicle?')) {
      try {
        await deleteVehicle(id);
        addToast('Vehicle removed successfully', 'success');
      } catch (err) {
        addToast(err.message || 'Failed to delete vehicle', 'error');
      }
    }
  };

  const handleAdd = async () => {
    if (!formData.model || !formData.brand || !formData.pricePerDay || !formData.registration) {
      addToast('Please fill all required fields (Brand, Model, Price, Registration)', 'error');
      return;
    }
    
    try {
      let photoUrl = formData.image;
      
      // Upload image first if selected
      if (selectedFile) {
        setUploading(true);
        try {
          const uploadedUrl = await api.uploadVehicleImage(selectedFile);
          photoUrl = `http://localhost:5000${uploadedUrl}`;
        } catch (uploadErr) {
          addToast(uploadErr.message || 'Failed to upload image', 'error');
          setUploading(false);
          return;
        }
      }
      
      await addVehicle({
        brand: formData.brand,
        model: formData.model,
        name: formData.model,
        type: formData.type,
        fuel: formData.fuel,
        seats: formData.seats,
        pricePerHour: Number(formData.pricePerHour),
        pricePerDay: Number(formData.pricePerDay),
        registration: formData.registration,
        image: photoUrl,
      });
      addToast('New vehicle added to the fleet!', 'success');
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      addToast(err.message || 'Failed to add vehicle', 'error');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      brand: '', model: '', type: 'car', pricePerDay: 50, pricePerHour: 10,
      fuel: 'petrol', seats: 4, registration: '', image: '',
    });
    setSelectedFile(null);
    setImagePreview(null);
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
                  <td><StatusBadge status={v.status === 'available' ? 'Available' : v.status === 'maintenance' ? 'Maintenance' : 'Unavailable'} /></td>
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

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title="Add New Vehicle">
        {/* Image Upload Section */}
        <div className="form-group mb-16">
          <label className="form-label">Vehicle Image</label>
          <div 
            onClick={() => fileInputRef.current?.click()} 
            style={{
              border: '2px dashed var(--gray-300)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: imagePreview ? 'transparent' : 'var(--gray-50)',
              transition: 'border-color 0.2s',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-300)'}
          >
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '150px', 
                  objectFit: 'contain',
                  borderRadius: '8px' 
                }} 
              />
            ) : (
              <>
                <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.4 }}>📷</div>
                <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  Click to upload vehicle image
                </p>
                <p style={{ margin: '4px 0 0', color: 'var(--gray-400)', fontSize: '0.75rem' }}>
                  PNG, JPG, GIF, WebP — Max 16MB
                </p>
              </>
            )}
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            style={{ display: 'none' }} 
            onChange={handleImageSelect}
          />
          {selectedFile && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="text-sm text-gray-500">📎 {selectedFile.name}</span>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={() => { setSelectedFile(null); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="form-group mb-16">
          <label className="form-label">Brand *</label>
          <input type="text" className="form-control" placeholder="e.g. Tesla" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
        </div>
        <div className="form-group mb-16">
          <label className="form-label">Model Name *</label>
          <input type="text" className="form-control" placeholder="e.g. Model S" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
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
            <label className="form-label">Fuel</label>
            <select className="form-control" value={formData.fuel} onChange={e => setFormData({...formData, fuel: e.target.value})}>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
            </select>
          </div>
        </div>
        <div className="grid grid-2 mb-16">
          <div className="form-group">
            <label className="form-label">Seats</label>
            <input type="number" className="form-control" value={formData.seats} onChange={e => setFormData({...formData, seats: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Registration *</label>
            <input type="text" className="form-control" placeholder="e.g. MH-02-AB-1234" value={formData.registration} onChange={e => setFormData({...formData, registration: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-2 mb-16">
          <div className="form-group">
            <label className="form-label">Price per Day (₹) *</label>
            <input type="number" className="form-control" value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Price per Hour (₹)</label>
            <input type="number" className="form-control" value={formData.pricePerHour} onChange={e => setFormData({...formData, pricePerHour: e.target.value})} />
          </div>
        </div>
        <div className="flex justify-end gap-8 mt-24">
          <button className="btn btn-ghost" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Save Vehicle'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminVehicles;
