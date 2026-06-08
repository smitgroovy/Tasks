import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { Button } from '../components/ui/Button';

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get('/categories'),
      api.get(`/categories/${id}/tasks`),
    ]).then(([catsRes, tasksRes]) => {
      const cat = catsRes.data.data.categories.find((c: any) => c._id === id);
      setCategory(cat);
      setTasks(tasksRes.data.data.tasks);
      setLoading(false);
    });
  }, [id]);

  const handleToggle = (task: any) => {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
  };

  const handleDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  if (loading) {
    return <div className="py-12 text-center text-ink-muted dark:text-gray-500">Loading...</div>;
  }

  if (!category) {
    return <div className="py-12 text-center text-ink-muted dark:text-gray-500">Category not found</div>;
  }

  const completedCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h2 className="text-2xl font-semibold tracking-tight">{category.name}</h2>
        </div>
        <Button onClick={() => setFormOpen(true)} size="sm">
          Add task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-ink-muted dark:text-gray-500">No tasks in this category</p>
          <p className="text-sm text-ink-muted dark:text-gray-500 mt-1">
            Add a task and assign it to {category.name}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-ink-muted dark:text-gray-500">
              {completedCount} of {tasks.length} done
            </span>
            {completedCount > 0 && (
              <div className="flex-1 h-1 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedCount / tasks.length) * 100}%`,
                    backgroundColor: category.color,
                  }}
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
                onEdit={(t) => {
                  setEditTask(t);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTask(null);
        }}
        task={editTask}
        preselectedCategory={id}
        onSaved={(t) => {
          if (editTask?._id) {
            setTasks((prev) => prev.map((p) => (p._id === t._id ? t : p)));
          } else {
            setTasks((prev) => [t, ...prev]);
          }
        }}
      />
    </div>
  );
}
