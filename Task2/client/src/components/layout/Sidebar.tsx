import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/', label: 'Today' },
  { to: '/upcoming', label: 'Upcoming' },
  { to: '/dashboard', label: 'Dashboard' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
    isActive
      ? 'bg-ink text-white dark:bg-white dark:text-dark'
      : 'text-ink-soft hover:bg-surface-2 hover:text-ink dark:text-gray-400 dark:hover:bg-dark-2 dark:hover:text-white'
  );

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen fixed left-0 top-0 border-r border-gray-100 dark:border-dark-border bg-surface dark:bg-dark">
      <div className="px-6 py-5">
        <h1 className="text-lg font-semibold tracking-tight">Flowdo</h1>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 dark:border-dark-border space-y-1">
        <NavLink to="/categories" className={linkClass}>Categories</NavLink>
        <NavLink to="/settings" className={linkClass}>Settings</NavLink>

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
