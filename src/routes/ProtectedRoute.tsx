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
    return <div className="app-shell p-4">Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Nếu route yêu cầu quyền 'admin' nhưng user không phải 'admin' -> Đẩy về trang nhân viên
  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  // Nếu route yêu cầu quyền 'employee' nhưng user lại là 'admin' -> Đẩy về trang quản trị
  if (role === 'employee' && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}