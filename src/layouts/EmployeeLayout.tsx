import { Outlet } from 'react-router-dom';
import { EmployeeSidebar } from '../components/layout/EmployeeSidebar';
import { AppHeader } from '../components/layout/AppHeader';

export function EmployeeLayout() {
  return (
    <div className="app-shell app-shell-employee">
      <AppHeader />
      <div className="app-body">
        <EmployeeSidebar />
        <section className="app-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}