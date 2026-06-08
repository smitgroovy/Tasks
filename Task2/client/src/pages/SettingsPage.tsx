import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
      </div>

      <div className="space-y-6">
        <div className="card divide-y divide-gray-100 dark:divide-dark-border">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-ink-muted dark:text-gray-500">{user?.name}</p>
            </div>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-ink-muted dark:text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-ink-muted dark:text-gray-500 capitalize">{theme}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              Toggle
            </Button>
          </div>
        </div>

        <div>
          <Button variant="danger" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
