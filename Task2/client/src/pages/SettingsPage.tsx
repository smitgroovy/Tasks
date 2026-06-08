import { useTheme } from '../context/ThemeContext';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
      </div>

      <div className="space-y-6">
        <div className="card divide-y divide-gray-100 dark:divide-dark-border">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-ink-muted dark:text-gray-500 capitalize">{theme}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface-2 dark:text-gray-400 dark:hover:bg-dark-2 rounded-lg transition-colors"
            >
              Toggle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
