import { startOfDay, endOfDay, startOfWeek, endOfWeek, addDays, isAfter, isBefore, parseISO } from 'date-fns';

export function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfDay(now),
    end: endOfDay(now),
  };
}

export function getWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  };
}

export function isOverdue(dueDate: Date | string | null): boolean {
  if (!dueDate) return false;
  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isBefore(date, startOfDay(new Date()));
}

export function isDueToday(dueDate: Date | string | null): boolean {
  if (!dueDate) return false;
  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const today = startOfDay(new Date());
  return !isBefore(date, today) && !isAfter(date, endOfDay(new Date()));
}

export function getNextDueDate(dueDate: Date, recurrence: { type: string; interval: number; daysOfWeek?: number[] }): Date | null {
  if (recurrence.type === 'none') return null;

  const next = new Date(dueDate);

  switch (recurrence.type) {
    case 'daily':
      next.setDate(next.getDate() + recurrence.interval);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7 * recurrence.interval);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + recurrence.interval);
      break;
    case 'custom':
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        const currentDay = next.getDay();
        const sortedDays = [...recurrence.daysOfWeek].sort((a, b) => a - b);
        for (const day of sortedDays) {
          if (day > currentDay) {
            next.setDate(next.getDate() + (day - currentDay));
            return next;
          }
        }
        next.setDate(next.getDate() + (7 - currentDay + sortedDays[0]));
      }
      break;
  }

  return next;
}
