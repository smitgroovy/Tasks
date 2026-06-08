import { format, formatDistanceToNow, isToday, isTomorrow, isPast, parseISO, startOfDay } from 'date-fns';

export function formatDueDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;

  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';

  return format(date, 'MMM d');
}

export function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return isPast(date) && !isToday(date);
}

export function formatRelative(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'h:mm a');
}
