import { NavLink } from 'react-router-dom';

const links = [
  ['Dashboard', '/employee/dashboard'],
  ['Khách hàng', '/employee/khach-hang'],
  ['Bất động sản', '/employee/bat-dong-san'],
  ['Nhu cầu', '/employee/nhu-cau'],
  ['Giao dịch', '/employee/giao-dich'],
  ['Thông báo', '/employee/thong-bao'],
  ['Biểu mẫu', '/employee/ho-so-bieu-mau'],
  ['Hồ sơ', '/employee/profile'],
];

export function EmployeeSidebar() {
  return (
    <aside className="app-sidebar">
      {links.map(([label, to]) => (
        <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          {label}
        </NavLink>
      ))}
    </aside>
  );
}