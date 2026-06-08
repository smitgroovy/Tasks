import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Today', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
  )},
  { to: '/upcoming', label: 'Upcoming', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
  )},
  { to: '/dashboard', label: 'Dashboard', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )},
];

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen fixed left-0 top-0 border-r border-gray-100 dark:border-dark-border bg-surface dark:bg-dark">
      <div className="px-6 py-5">
        <h1 className="text-lg font-semibold tracking-tight">Flowdo</h1>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-ink text-white dark:bg-white dark:text-dark'
                  : 'text-ink-soft hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-dark-2 dark:hover:text-white'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 dark:border-dark-border space-y-1">
        <NavLink
          to="/categories"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-ink text-white dark:bg-white dark:text-dark'
                : 'text-ink-soft hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-dark-2 dark:hover:text-white'
            )
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>
          Categories
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-ink text-white dark:bg-white dark:text-dark'
                : 'text-ink-soft hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-dark-2 dark:hover:text-white'
            )
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          Settings
        </NavLink>

        <div className="flex items-center gap-2 px-3 pt-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-dark-2 dark:hover:text-white transition-colors"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        <div className="px-3 pt-2 flex items-center justify-between">
          <span className="text-xs text-ink-muted dark:text-gray-500 truncate">{user?.name}</span>
          <button
            onClick={logout}
            className="text-xs text-ink-muted hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
