export function AdminSettings() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-ink-muted dark:text-gray-500 mt-1">System configuration</p>
      </div>

      <div className="card divide-y divide-gray-100 dark:divide-dark-border">
        <div className="px-5 py-4">
          <p className="text-sm font-medium">Maintenance mode</p>
          <p className="text-xs text-ink-muted dark:text-gray-500 mt-0.5">
            When enabled, only admins can access the app
          </p>
          <button className="btn-primary text-xs mt-3 px-3 py-1.5" disabled>
            Coming soon
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm font-medium">Site name</p>
          <p className="text-xs text-ink-muted dark:text-gray-500 mt-0.5">
            Customize the application name
          </p>
          <button className="btn-primary text-xs mt-3 px-3 py-1.5" disabled>
            Coming soon
          </button>
        </div>
      </div>
    </div>
  );
}
