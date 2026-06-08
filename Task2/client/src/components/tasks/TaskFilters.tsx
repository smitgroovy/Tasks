import { useState } from 'react';
import { cn } from '../../utils/cn';

interface TaskFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function TaskFilters({ onFilterChange }: TaskFiltersProps) {
  const [activePriority, setActivePriority] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  const handlePriority = (priority: string | null) => {
    const next = activePriority === priority ? null : priority;
    setActivePriority(next);
    onFilterChange({ priority: next });
  };

  const handleStatus = (status: string | null) => {
    const next = activeStatus === status ? null : status;
    setActiveStatus(next);
    onFilterChange({ status: next });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-ink-muted dark:text-gray-500 mr-1">Priority:</span>
      {['urgent', 'high', 'medium', 'low'].map((p) => (
        <button
          key={p}
          onClick={() => handlePriority(p)}
          className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize',
            activePriority === p
              ? 'bg-ink text-white dark:bg-white dark:text-dark'
              : 'text-ink-muted hover:bg-surface-2 dark:text-gray-500 dark:hover:bg-dark-2'
          )}
        >
          {p}
        </button>
      ))}

      <div className="w-px h-4 bg-gray-200 dark:bg-dark-border mx-1" />

      <span className="text-xs font-medium text-ink-muted dark:text-gray-500 mr-1">Status:</span>
      {['todo', 'in_progress', 'done'].map((s) => (
        <button
          key={s}
          onClick={() => handleStatus(s)}
          className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize',
            activeStatus === s
              ? 'bg-ink text-white dark:bg-white dark:text-dark'
              : 'text-ink-muted hover:bg-surface-2 dark:text-gray-500 dark:hover:bg-dark-2'
          )}
        >
          {s === 'in_progress' ? 'In progress' : s}
        </button>
      ))}
    </div>
  );
}
