import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import { api } from '../../services/api';

const AdminUsers = () => {
  const { addToast } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer', location: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.getUsers()
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        addToast('Failed to load users', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createUser(formData);
      addToast('User created successfully', 'success');
      setShowModal(false);
      fetchUsers();
      setFormData({ name: '', email: '', password: '', role: 'customer', location: '' });
    } catch (err) {
      addToast(err.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-users">
      <div className="page-header flex-between mb-24">
        <div>
          <h2>User Management</h2>
          <p>View and manage all registered users and their roles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Create User
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Location</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-24 text-gray-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-24 text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td className="font-semibold">{u.name}</td>
                    <td className="text-gray-500">{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.role === 'admin' ? 'primary' : u.role === 'fleet' ? 'amber' : 'gray'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-gray-500">{u.location || '—'}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ width: '400px' }}>
            <div className="modal-header">
              <h3>Create New User</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body flex-col gap-16">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input required type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input required type="email" className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input required type="password" className="form-control" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="customer">Customer</option>
                  <option value="fleet">Fleet Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formData.role === 'fleet' && (
                <div className="form-group">
                  <label className="form-label">Assigned Location</label>
                  <input type="text" className="form-control" placeholder="e.g. Downtown Hub" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                </div>
              )}
              <div className="modal-footer mt-16 flex-end gap-12">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
