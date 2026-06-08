import { cn } from '../../utils/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
  size?: 'sm' | 'md';
}

export function Checkbox({ checked, onChange, color, size = 'md' }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-200',
        size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
        checked ? 'scale-110' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
      )}
      style={
        checked
          ? { backgroundColor: color || '#171717', borderColor: color || '#171717' }
          : undefined
      }
    >
      {checked && (
        <svg
          className={cn('text-white', size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}
