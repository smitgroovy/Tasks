import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
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
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data.categories));
  }, []);

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
        <NavLink to="/categories" className={linkClass}>
          <span>Manage categories</span>
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <span>Settings</span>
        </NavLink>

        <div className="px-3 pt-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-dark-2 dark:hover:text-white transition-colors w-full"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </div>
    </aside>
  );
}
