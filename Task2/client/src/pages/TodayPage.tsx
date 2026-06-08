import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { QuickAdd } from '../components/tasks/QuickAdd';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { getGreeting } from '../utils/constants';

export function TodayPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks/today');
      setTasks(data.data.tasks);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleTaskCreated = (task: any) => {
    setTasks(prev => [task, ...prev]);
  };

  const handleToggle = (task: any) => {
    setTasks(prev => prev.map(t => t._id === task._id ? task : t));
  };

  const handleDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t._id !== taskId));
  };

  const handleFilterChange = async (filters: any) => {
    try {
      const params = new URLSearchParams();
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.status) params.set('status', filters.status);
      const { data } = await api.get(`/tasks?${params.toString()}`);
      setTasks(data.data.tasks);
    } catch { /* empty */ }
  };

  const completedCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-muted dark:text-gray-500 mb-1">
          {getGreeting()}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">Today</h2>
      </div>

      <QuickAdd onTaskCreated={handleTaskCreated} />

      <div className="flex items-center justify-between">
        <TaskFilters onFilterChange={handleFilterChange} />
      </div>

      {loading ? (
        <div className="py-12 text-center text-ink-muted dark:text-gray-500">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-ink-muted dark:text-gray-500">No tasks for today</p>
          <p className="text-sm text-ink-muted dark:text-gray-500 mt-1">Add one above or press / to quick-add</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-ink-muted dark:text-gray-500">
              {tasks.filter(t => t.status === 'done').length} of {tasks.length} done
            </span>
            {tasks.filter(t => t.status === 'done').length > 0 && (
              <div className="flex-1 h-1 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-ink dark:bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(tasks.filter(t => t.status === 'done').length / tasks.length) * 100}%` }}
                />
              </div>
            )}
          </div>
          <div className="space-y-0.5">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onEdit={(t) => { setEditTask(t); setFormOpen(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
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
