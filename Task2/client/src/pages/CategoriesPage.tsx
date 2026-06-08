import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { CATEGORY_COLORS } from '../utils/constants';

export function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data.categories));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/categories', { name: name.trim(), color });
      setCategories((prev) => [...prev, { ...data.data.category, taskCount: 0 }]);
      setName('');
      setFormOpen(false);
      success('Category created');
    } catch {
      error('Failed to create category');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      success('Category deleted');
    } catch {
      error('Failed to delete category');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
          <p className="text-sm text-ink-muted dark:text-gray-500 mt-1">
            Organize your tasks into meaningful groups
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} size="sm">
          New category
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/categories/${cat._id}`}
            className="card px-5 py-4 flex items-center justify-between hover:border-gray-200 dark:hover:border-dark-border transition-colors group"
          >
            <div className="flex items-center gap-4">
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <div>
                <span className="text-sm font-medium group-hover:text-ink dark:group-hover:text-white transition-colors">
                  {cat.name}
                </span>
                <p className="text-xs text-ink-muted dark:text-gray-500 mt-0.5">
                  {cat.taskCount} active {cat.taskCount === 1 ? 'task' : 'tasks'}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete(cat._id);
              }}
              className="opacity-0 group-hover:opacity-100 text-xs text-ink-muted hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-all"
            >
              Delete
            </button>
          </Link>
        ))}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="New category">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Work, Personal, Health..."
            autoFocus
          />
          <div className="space-y-1.5">
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-ink dark:ring-white' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()} className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
