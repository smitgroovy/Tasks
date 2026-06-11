import { useState } from 'react';
import { UserEditModal } from './UserEditModal';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface UserRowProps {
  user: User;
  onUpdate: () => void;
}

const roleColors: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  editor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  user: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export function UserRow({ user, onUpdate }: UserRowProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <tr className="border-b border-gray-100 dark:border-dark-border hover:bg-surface-2 dark:hover:bg-dark-2 transition-colors">
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-ink/10 dark:bg-white/10 flex items-center justify-center text-xs font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-ink-muted dark:text-gray-500">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${roleColors[user.role] || roleColors.user}`}>
            {user.role}
          </span>
        </td>
        <td className="py-3 px-4">
          {user.isActive ? (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active</span>
          ) : (
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Suspended</span>
          )}
        </td>
        <td className="py-3 px-4 text-xs text-ink-muted dark:text-gray-500">
          {user.emailVerified ? 'Verified' : 'Unverified'}
        </td>
        <td className="py-3 px-4 text-xs text-ink-muted dark:text-gray-500">
          {new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td className="py-3 px-4 text-right">
          <button
            onClick={() => setEditOpen(true)}
            className="btn-ghost text-xs px-2 py-1"
          >
            Edit
          </button>
        </td>
      </tr>

      {editOpen && (
        <UserEditModal
          user={user}
          onClose={() => setEditOpen(false)}
          onUpdated={onUpdate}
        />
      )}
    </>
  );
}
