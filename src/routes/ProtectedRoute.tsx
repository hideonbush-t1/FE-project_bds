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

  if (role === 'admin' && !user.isAdmin) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (role === 'employee' && user.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}