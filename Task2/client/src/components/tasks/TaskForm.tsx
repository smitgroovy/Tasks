import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PRIORITIES, Priority } from '../../utils/priorities';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  task?: any;
  onSaved: (task: any) => void;
}

export function TaskForm({ open, onClose, task, onSaved }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        priority,
      };
      if (dueDate) payload.dueDate = new Date(dueDate).toISOString();

      let result;
      if (task?._id) {
        const { data } = await api.patch(`/tasks/${task._id}`, payload);
        result = data.data.task;
      } else {
        const { data } = await api.post('/tasks', payload);
        result = data.data.task;
      }

      onSaved(result);
      onClose();
      success(task?._id ? 'Task updated' : 'Task created');
    } catch {
      error('Failed to save task');
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={task?._id ? 'Edit task' : 'New task'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          autoFocus
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details..."
        />

        <div className="space-y-1.5">
          <label className="label">Priority</label>
          <div className="flex gap-2">
            {(Object.keys(PRIORITIES) as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  priority === p
                    ? 'border-current'
                    : 'border-gray-200 dark:border-dark-border hover:border-gray-300'
                }`}
                style={{ color: priority === p ? PRIORITIES[p].color : undefined }}
              >
                {PRIORITIES[p].label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !title.trim()} className="flex-1">
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
