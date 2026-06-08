import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileNav />
      <main className="lg:ml-[260px] pt-14 lg:pt-0">
        <div className="max-w-[720px] mx-auto px-5 py-8 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
