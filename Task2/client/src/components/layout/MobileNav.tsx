import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
              ...(isAdmin ? [{ to: '/admin', label: 'Admin panel' }] : []),
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

            <div className="pt-3 border-t border-gray-100 dark:border-dark-border space-y-2">
              <button
                onClick={() => { toggleTheme(); setOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-ink-soft hover:bg-surface-2 dark:text-gray-400 dark:hover:bg-dark-2 transition-colors"
              >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>

              {user && (
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-ink/10 dark:bg-white/10 flex items-center justify-center text-2xs font-semibold flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{user.name}</p>
                      <p className="text-2xs text-ink-muted dark:text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-ink-muted dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
