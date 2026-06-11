import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout() {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-dark">
        <p className="text-sm text-ink-muted dark:text-gray-500">Access denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 ml-[240px]">
        <main className="max-w-[960px] mx-auto px-8 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
