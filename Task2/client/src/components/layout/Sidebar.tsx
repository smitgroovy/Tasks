import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const navItems = [
  { to: '/', label: 'Today' },
  { to: '/upcoming', label: 'Upcoming' },
  { to: '/dashboard', label: 'Dashboard' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
    isActive
      ? 'bg-ink text-white dark:bg-white dark:text-dark'
      : 'text-ink-soft hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-dark-2 dark:hover:text-white'
  );

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data.categories));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen fixed left-0 top-0 border-r border-gray-100 dark:border-dark-border bg-surface dark:bg-dark">
      <div className="px-6 py-5">
        <h1 className="text-lg font-semibold tracking-tight">Flowdo</h1>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-4 pb-2 px-3">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-muted dark:text-gray-500">
            Categories
          </p>
        </div>

        {categories.map((cat) => (
          <NavLink
            key={cat._id}
            to={`/categories/${cat._id}`}
            className={linkClass}
          >
            <span className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </span>
            {cat.taskCount > 0 && (
              <span className="text-xs text-ink-muted dark:text-gray-500 tabular-nums">
                {cat.taskCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 dark:border-dark-border space-y-1">
        {isAdmin && (
          <NavLink to="/admin" className={linkClass}>
            <span className="flex items-center gap-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Admin panel
            </span>
          </NavLink>
        )}

        <NavLink to="/categories" className={linkClass}>
          <span>Manage categories</span>
        </NavLink>

        <NavLink to="/settings" className={linkClass}>
          <span>Settings</span>
        </NavLink>

        <div className="px-3 pt-3 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-dark-2 dark:hover:text-white transition-colors w-full"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-ink/10 dark:bg-white/10 flex items-center justify-center text-2xs font-semibold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user?.name}</p>
                <p className="text-2xs text-ink-muted dark:text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-ink-muted dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
              title="Logout"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
