import { NavLink } from 'react-router-dom';

const links = [
  ['Dashboard', '/admin/dashboard'],
  ['Nhân viên', '/admin/nhan-vien'],
  ['Khách hàng', '/admin/khach-hang'],
  ['Bất động sản', '/admin/bat-dong-san'],
  ['Nhu cầu', '/admin/nhu-cau'],
  ['Giao dịch', '/admin/giao-dich'],
  ['Thông báo', '/admin/thong-bao'],
  ['Biểu mẫu', '/admin/ho-so-bieu-mau'],
  ['Hồ sơ', '/admin/profile'],
];

export function AdminSidebar() {
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