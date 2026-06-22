import { useAuth } from '../../contexts/AuthContext';

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header 
      className="app-header"
      style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%',
        padding: '10px 20px' 
      }}
    >
      
      <div style={{ flexShrink: 0 }}>
        <div style={{ margin: 0, fontSize: '0.85rem', color: '#6c757d' }}>Batdongsan Center</div>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
          Hệ thống quản lý trung tâm môi giới
        </h1>
      </div>
      
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          columnGap: '15px', 
          flexShrink: 0, 
          minWidth: 'max-content' 
        }}
      >
        {/* Khối chứa tên và chức vụ */}
        {user && (
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontWeight: '600', margin: 0, lineHeight: '1.2' }}>
              {user.hoTen}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6c757d', margin: 0, lineHeight: '1.2' }}>
              {String(user.Role || user.role).toLowerCase() === 'admin' ? 'Quản trị hệ thống' : 'Nhân viên'}
            </span>
          </div>
        )}
        
        <button 
          className="btn btn-outline-light btn-sm" 
          onClick={logout}
          style={{ margin: 0, whiteSpace: 'nowrap', height: 'fit-content' }}
        >
          Đăng xuất
        </button>
      </div>
      
    </header>
  );
}