import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';

const AdminUsers = () => {
  const { addToast } = useApp();
  
  // Mock users list
  const [users, setUsers] = useState([
    { id: 'u1', name: 'Admin User', email: 'admin@vrmp.com', role: 'admin', joined: '2023-10-12', status: 'Active' },
    { id: 'u2', name: 'Fleet Manager', email: 'fleet@vrmp.com', role: 'fleet', joined: '2023-11-05', status: 'Active' },
    { id: 'u3', name: 'Jane Customer', email: 'customer@vrmp.com', role: 'customer', joined: '2024-01-20', status: 'Active' },
    { id: 'u4', name: 'Robert Smith', email: 'robert@gmail.com', role: 'customer', joined: '2024-02-15', status: 'Suspended' },
    { id: 'u5', name: 'Alice Wong', email: 'alice@vrmp.com', role: 'fleet', joined: '2024-03-01', status: 'Active' },
  ]);

  const handleStatusChange = (userId, newStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    addToast(`User account ${newStatus.toLowerCase()}`, 'success');
  };

  return (
    <div className="admin-users">
      <div className="page-header flex-between mb-24">
        <div>
          <h2>User Management</h2>
          <p>View and manage all registered users and their roles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => addToast('Manual user creation not implemented', 'info')}>
          Add New User
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
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-semibold">{u.name}</td>
                  <td className="text-gray-500">{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role === 'admin' ? 'primary' : u.role === 'fleet' ? 'amber' : 'gray'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(u.joined).toLocaleDateString()}</td>
                  <td>
                    <StatusBadge status={u.status} />
                  </td>
                  <td>
                    <div className="flex gap-8">
                      {u.status === 'Active' ? (
                        <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(u.id, 'Suspended')}>Suspend</button>
                      ) : (
                        <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(u.id, 'Active')}>Activate</button>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => addToast('Feature coming soon', 'info')}>Edit</button>
                    </div>
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

export default AdminUsers;
