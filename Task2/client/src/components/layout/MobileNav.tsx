import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="lg:hidden">
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-surface/90 dark:bg-dark/90 backdrop-blur-xl border-b border-gray-100 dark:border-dark-border">
        <h1 className="text-base font-semibold">Flowdo</h1>
        <button
          onClick={() => setOpen(!open)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-2 dark:hover:bg-dark-2 transition-colors"
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          )}
        </button>
      </header>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
          <nav className="fixed top-14 left-0 right-0 z-50 bg-surface dark:bg-dark border-b border-gray-100 dark:border-dark-border p-4 space-y-1 animate-fade-in">
            {[
              { to: '/', label: 'Today' },
              { to: '/upcoming', label: 'Upcoming' },
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/categories', label: 'Categories' },
              { to: '/settings', label: 'Settings' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-ink text-white dark:bg-white dark:text-dark'
                      : 'text-ink-soft hover:bg-surface-2 dark:text-gray-400 dark:hover:bg-dark-2'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => { toggleTheme(); setOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-ink-soft hover:bg-surface-2 dark:text-gray-400 dark:hover:bg-dark-2 transition-colors"
              >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
