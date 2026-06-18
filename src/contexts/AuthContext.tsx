import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

// Cập nhật lại Type cho khớp 100% với dữ liệu Backend trả về
type User = {
  id: string;
  maNV: string;
  hoTen: string;
  email: string;
  soDienThoai?: string | null;
  chucVu: string;
  role: string; // Đã sửa từ isAdmin thành role
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (maNV: string, matKhau: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .profile()
      .then((response) => setUser(response.data))
      .catch(() => {
        localStorage.removeItem('accessToken');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (maNV: string, matKhau: string) => {
    // 1. Gọi API
    const response = await authService.login(maNV, matKhau);
    
    // 2. Ép kiểu dữ liệu sang any để TypeScript ngừng gạch đỏ
    const data: any = response.data; 
    
    // 3. Lấy đúng tên biến access_token (có dấu gạch dưới) từ Backend
    localStorage.setItem('accessToken', data.access_token);
    
    // 4. Cập nhật state User
    setUser(data.user);
    
    // 5. Điều hướng chuẩn xác dựa trên trường 'role'
    if (data.user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/employee/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    navigate('/');
  };

  const refreshProfile = async () => {
    const response = await authService.profile();
    setUser(response.data);
  };

  const value = useMemo(() => ({ user, loading, login, logout, refreshProfile }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}