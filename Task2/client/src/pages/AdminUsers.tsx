import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/admin.service';
import { UserRow } from '../components/admin/UserRow';

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

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getUsers({
        page,
        limit: 20,
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(result.users);
      setTotalPages(result.pagination.pages);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
        <p className="text-sm text-ink-muted dark:text-gray-500 mt-1">Manage all users</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input max-w-sm"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input max-w-[140px]"
        >
          <option value="">All roles</option>
          <option value="super_admin">super_admin</option>
          <option value="admin">admin</option>
          <option value="editor">editor</option>
          <option value="user">user</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-gray-500">User</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-gray-500">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-gray-500">Joined</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-ink-muted dark:text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <UserRow key={u._id} user={u} onUpdate={fetchUsers} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost text-xs disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-xs text-ink-muted dark:text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost text-xs disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
