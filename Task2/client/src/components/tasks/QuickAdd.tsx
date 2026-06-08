import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';

interface QuickAddProps {
  onTaskCreated: (task: any) => void;
}

export function QuickAdd({ onTaskCreated }: QuickAddProps) {
  const [title, setTitle] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !focused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focused]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const { data } = await api.post('/tasks', { title: title.trim() });
      onTaskCreated(data.data.task);
      setTitle('');
      success('Task added');
    } catch {
      error('Failed to add task');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200',
          focused
            ? 'border-ink dark:border-white shadow-sm'
            : 'border-gray-200 dark:border-dark-border'
        )}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-muted dark:text-gray-500 flex-shrink-0">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Add a task... (press / to focus)"
          className="flex-1 bg-transparent text-base placeholder:text-ink-muted dark:placeholder:text-gray-500 focus:outline-none"
        />
        {title.trim() && (
          <button
            type="submit"
            className="text-xs font-medium text-ink-muted hover:text-ink dark:text-gray-500 dark:hover:text-white transition-colors"
          >
            Add
          </button>
        )}
      </div>
    </form>
  );
}
