import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
export function ProtectedRoute({ role, children }: { role: string, children: JSX.Element }) {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/" />;

  const decoded: any = jwtDecode(token);
  
  // LOG NÀY SẼ CHO BẠN BIẾT BẠN BỊ CHẶN VÌ SAO
  console.log('ProtectedRoute đang kiểm tra, Role token:', decoded.role, 'Role route yêu cầu:', role);

  if (decoded.role !== role) {
    return <Navigate to={`/${decoded.role}/dashboard`} replace />;
  }
  return children;
}