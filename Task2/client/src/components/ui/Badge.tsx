import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'default' | 'solid';
  className?: string;
}

export function Badge({ children, color, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
        variant === 'default' && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        variant === 'solid' && 'text-white',
        className
      )}
      style={variant === 'solid' && color ? { backgroundColor: color } : undefined}
    >
      {children}
    </span>
  );
}
