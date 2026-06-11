interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="card px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-gray-500">
        {label}
      </p>
      <p className="text-2xl font-semibold tracking-tight mt-1">{value}</p>
      {sub && (
        <p className="text-xs text-ink-muted dark:text-gray-500 mt-0.5">{sub}</p>
      )}
    </div>
  );
}
