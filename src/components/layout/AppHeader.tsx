import { useAuth } from '../../contexts/AuthContext';

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div>
        <div className="eyebrow">Batdongsan Center</div>
        <h1 className="app-title">Hệ thống quản lý trung tâm môi giới</h1>
      </div>
      <div className="app-header-user">
        <div>
          <div className="fw-semibold">{user?.hoTen}</div>
          {/* Đã thay đổi: Dùng role thay vì isAdmin */}
          <div className="text-muted small">
            {user?.role?.toLowerCase() === 'admin' ? 'Admin' : 'Nhân viên'}
          </div>
        </div>
        <button className="btn btn-outline-light btn-sm" onClick={logout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}