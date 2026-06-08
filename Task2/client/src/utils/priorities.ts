export const PRIORITIES = {
  urgent: { label: 'Urgent', color: '#ef4444', bg: 'bg-red-50', darkBg: 'bg-red-950', text: 'text-red-600', darkText: 'text-red-400' },
  high: { label: 'High', color: '#f97316', bg: 'bg-orange-50', darkBg: 'bg-orange-950', text: 'text-orange-600', darkText: 'text-orange-400' },
  medium: { label: 'Medium', color: '#eab308', bg: 'bg-yellow-50', darkBg: 'bg-yellow-950', text: 'text-yellow-600', darkText: 'text-yellow-400' },
  low: { label: 'Low', color: '#6b7280', bg: 'bg-gray-50', darkBg: 'bg-gray-900', text: 'text-gray-500', darkText: 'text-gray-400' },
} as const;

export type Priority = keyof typeof PRIORITIES;
