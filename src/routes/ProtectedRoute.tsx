import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({
  role,
  children,
}: {
  role: 'admin' | 'employee';
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="app-shell p-4">Đang tải dữ liệu...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 💡 Xử lý triệt để vụ Role viết hoa hay viết thường từ Backend trả về
  const isUserAdmin = String(user.Role || user.role).toLowerCase() === 'admin';

  if (role === 'admin' && !isUserAdmin) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (role === 'employee' && isUserAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}