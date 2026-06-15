import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AppHeader } from '../components/layout/AppHeader';

export function AdminLayout() {
  return (
    <div className="app-shell app-shell-admin">
      <AppHeader />
      <div className="app-body">
        <AdminSidebar />
        <section className="app-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}