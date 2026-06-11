import { useState } from 'react';
import { Checkbox } from '../ui/Checkbox';
import { Badge } from '../ui/Badge';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { cn } from '../../utils/cn';
import { PRIORITIES, Priority } from '../../utils/priorities';
import { formatDueDate, isOverdue, formatRelative } from '../../utils/dateHelpers';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface TaskCardProps {
  task: any;
  onToggle: (task: any) => void;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { success, error } = useToast();

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (task.status === 'done') {
        const { data } = await api.patch(`/tasks/${task._id}`, { status: 'todo', completedAt: null });
        onToggle(data.data.task);
      } else {
        const { data } = await api.post(`/tasks/${task._id}/complete`);
        onToggle(data.data.task);
        success('Task completed');
      }
    } catch {
      error('Failed to update task');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${task._id}`);
      onDelete(task._id);
      success('Task deleted');
    } catch {
      error('Failed to delete task');
    }
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const priority = PRIORITIES[task.priority as Priority];
  const overdue = task.status !== 'done' && isOverdue(task.dueDate);
  const hasDescription = task.description && task.description.trim().length > 0;

  return (
    <div
      className={cn(
        'group rounded-xl transition-all duration-200',
        'hover:bg-surface-2 dark:hover:bg-dark-2',
        task.status === 'done' && 'opacity-50',
        expanded && 'bg-surface-2 dark:bg-dark-2'
      )}
    >
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={task.status === 'done'}
            onChange={handleToggle}
            color={priority?.color}
            disabled={loading}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'text-base font-medium transition-all duration-200',
                task.status === 'done' && 'line-through text-ink-muted dark:text-gray-500'
              )}
            >
              {task.title}
            </span>
            {hasDescription && !expanded && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-muted dark:text-gray-500 flex-shrink-0">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.priority && task.priority !== 'medium' && (
              <Badge color={priority.color} variant="solid">
                {priority.label}
              </Badge>
            )}
            {task.dueDate && (
              <span
                className={cn(
                  'text-xs font-medium',
                  overdue ? 'text-red-500' : 'text-ink-muted dark:text-gray-500'
                )}
              >
                {formatDueDate(task.dueDate)}
              </span>
            )}
            {task.categoryId && (
              <Badge>
                <span
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: task.categoryId.color }}
                />
                {task.categoryId.name}
              </Badge>
            )}
            {task.tags?.map((tag: any) => (
              <Badge key={tag._id} color={tag.color} variant="solid">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Dropdown
            trigger={
              <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-dark-border transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            }
          >
            <DropdownItem onClick={handleEdit}>Edit</DropdownItem>
            <DropdownItem onClick={handleDelete} danger>Delete</DropdownItem>
          </Dropdown>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-md text-ink-muted dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-border transition-all"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={cn('transition-transform', expanded && 'rotate-180')}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 animate-fade-in">
          {hasDescription && (
            <p className="text-sm text-ink-soft dark:text-gray-400 mb-3 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-ink-muted dark:text-gray-500">
            <span>Created {formatRelative(task.createdAt)}</span>
            {task.subtaskCount !== undefined && (
              <span>{task.subtaskCount} subtasks</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
