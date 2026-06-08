import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { format, parseISO, startOfDay } from 'date-fns';

export function UpcomingPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks/upcoming?days=30');
      setTasks(data.data.tasks);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const grouped = tasks.reduce((acc: Record<string, any[]>, task) => {
    if (!task.dueDate) return acc;
    const dateKey = task.dueDate.split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Upcoming</h2>
        <p className="text-sm text-ink-muted dark:text-gray-500 mt-1">Next 30 days</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-ink-muted dark:text-gray-500">Loading...</div>
      ) : sortedDates.length === 0 ? (
        <div className="py-12 text-center text-ink-muted dark:text-gray-500">
          No upcoming tasks
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((dateKey) => {
            const date = parseISO(dateKey);
            const isToday = startOfDay(date).getTime() === startOfDay(new Date()).getTime();
            return (
              <div key={dateKey}>
                <h3 className="text-sm font-semibold text-ink-muted dark:text-gray-500 mb-3 sticky top-14 lg:top-0 bg-surface dark:bg-dark z-10 py-1">
                  {isToday ? 'Today' : format(date, 'EEEE, MMM d')}
                </h3>
                <div className="space-y-0.5">
                  {grouped[dateKey].map((task: any) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggle={(t) => setTasks(prev => prev.map(p => p._id === t._id ? t : p))}
                      onEdit={(t) => { setEditTask(t); setFormOpen(true); }}
                      onDelete={(id) => setTasks(prev => prev.filter(p => p._id !== id))}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null); }}
        task={editTask}
        onSaved={(t) => {
          setTasks(prev => prev.map(p => p._id === t._id ? t : p));
          if (!editTask?._id) setTasks(prev => [t, ...prev]);
        }}
      />
    </div>
  );
}
