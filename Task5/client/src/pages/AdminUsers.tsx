import { useState, useEffect, FormEvent } from 'react';
import { adminApi } from '../api/admin';
import { User } from '../api/auth';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'viewer' as string,
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
        });
      } else {
        await adminApi.createUser(formData);
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({ email: '', password: '', first_name: '', last_name: '', role: 'viewer' });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (user: User) => {
    try {
      await adminApi.updateUser(user.id, { is_active: !user.is_active });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <span>Loading users...</span>
    </div>
  );

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h2>Admin Panel</h2>
          <p className="text-muted">Manage users, roles, and permissions</p>
        </div>
        <button onClick={() => { setEditingUser(null); setFormData({ email: '', password: '', first_name: '', last_name: '', role: 'viewer' }); setShowForm(!showForm); }} className="btn-primary">
          {showForm ? 'Close' : '+ Add User'}
        </button>
      </div>

      {error && <div className="error" onClick={() => setError('')}>{error}</div>}

      {showForm && (
        <div className="form-section">
          <form onSubmit={handleSubmit} className="admin-form">
            <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={!!editingUser} />
              </div>
              {!editingUser && (
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
                </div>
              )}
              <div className="form-group">
                <label>Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-section">
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                  <td>
                    <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  <td className="actions">
                    <button onClick={() => handleEdit(u)} className="btn-edit">Edit</button>
                    <button onClick={() => handleToggleActive(u)} className={`btn-edit ${u.is_active ? '' : 'btn-warning'}`}>
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="empty-state">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
