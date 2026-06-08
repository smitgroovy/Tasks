import { useState, useEffect } from 'react';
import api from '../services/api';
import { cn } from '../utils/cn';

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/dashboard/stats?period=week'),
          api.get('/dashboard/activity?days=7'),
        ]);
        setStats(statsRes.data.data);
        setActivity(activityRes.data.data.activity);
      } catch { /* empty */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-ink-muted dark:text-gray-500">Loading...</div>;
  }

  const maxCount = Math.max(...activity.map(a => a.count), 1);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-ink-muted dark:text-gray-500 mt-1">Your productivity at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Completed', value: stats?.completed || 0, color: 'text-green-600 dark:text-green-400' },
          { label: 'Created', value: stats?.created || 0, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Overdue', value: stats?.overdue || 0, color: 'text-red-600 dark:text-red-400' },
          { label: 'Streak', value: `${stats?.streak || 0}d`, color: 'text-amber-600 dark:text-amber-400' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-gray-500 mb-2">
              {stat.label}
            </p>
            <p className={cn('text-2xl font-semibold', stat.color)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink-muted dark:text-gray-500 mb-4">Activity — Last 7 days</h3>
        <div className="flex items-end gap-2 h-32">
          {activity.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex-1 flex items-end justify-center">
                <div
                  className="w-full max-w-[32px] rounded-md bg-ink/10 dark:bg-white/10 transition-all duration-500"
                  style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: day.count > 0 ? '8px' : '2px' }}
                />
              </div>
              <span className="text-xs text-ink-muted dark:text-gray-500">
                {new Date(day.date).toLocaleDateString('en', { weekday: 'short' }).charAt(0)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-ink-muted dark:text-gray-500">0</span>
          <span className="text-xs text-ink-muted dark:text-gray-500">{maxCount}</span>
        </div>
      </div>
    </div>
  );
}
