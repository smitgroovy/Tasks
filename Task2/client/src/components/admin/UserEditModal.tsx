import { useState, FormEvent } from 'react';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../context/ToastContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface UserEditModalProps {
  user: User;
  onClose: () => void;
  onUpdated: () => void;
}

export function UserEditModal({ user, onClose, onUpdated }: UserEditModalProps) {
  const { success: showSuccess, error: showError } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.updateUser(user._id, { name, email });
      if (role !== user.role) {
        await adminService.updateUserRole(user._id, role);
      }
      showSuccess('User updated');
      onUpdated();
      onClose();
    } catch (err: any) {
      showError(err?.response?.data?.error?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const result = await adminService.toggleUserStatus(user._id);
      showSuccess(result.isActive ? 'User activated' : 'User suspended');
      onUpdated();
      onClose();
    } catch (err: any) {
      showError(err?.response?.data?.error?.message || 'Failed to toggle status');
    }
  };

  const roles = ['super_admin', 'admin', 'editor', 'user'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-2 rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
        <h3 className="text-lg font-semibold mb-5">Edit user</h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label" htmlFor="edit-name">Name</label>
            <input id="edit-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
          </div>

          <div>
            <label className="label" htmlFor="edit-email">Email</label>
            <input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
          </div>

          <div>
            <label className="label" htmlFor="edit-role">Role</label>
            <select id="edit-role" value={role} onChange={(e) => setRole(e.target.value)} className="input">
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={handleToggleStatus} className="text-sm text-red-600 dark:text-red-400 hover:underline">
              {user.isActive ? 'Suspend user' : 'Activate user'}
            </button>

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
