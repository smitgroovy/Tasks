import { useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import { StatCard } from '../components/admin/StatCard';

interface Stats {
  users: { total: number; active: number; byRole: Record<string, number> };
  tasks: { total: number; byStatus: Record<string, number> };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-ink-muted dark:text-gray-500">Failed to load stats</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-ink-muted dark:text-gray-500 mt-1">System overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total users" value={stats.users.total} sub={`${stats.users.active} active`} />
        <StatCard label="Total tasks" value={stats.tasks.total} />
        {Object.entries(stats.users.byRole).map(([role, count]) => (
          <StatCard key={role} label={`${role} users`} value={count} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(stats.tasks.byStatus).map(([status, count]) => (
          <StatCard key={status} label={`Tasks: ${status}`} value={count} />
        ))}
      </div>
    </div>
  );
}
