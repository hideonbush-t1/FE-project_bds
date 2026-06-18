import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

type User = {
  id: string;
  maNV: string;
  hoTen: string;
  email: string;
  soDienThoai?: string | null;
  chucVu: string;
  role: string | number; // Chấp nhận cả chuỗi hoặc số từ Backend
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
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        // Giữ token để thử lại sau
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (maNV: string, matKhau: string) => {
    const response = await authService.login(maNV, matKhau);
    
    // Lưu token
    localStorage.setItem('accessToken', response.data.access_token);
    
    // Lưu user
    const userData = response.data.user;
    setUser(userData);
    
    // Chuẩn hóa role về chuỗi để so sánh
    const role = String(userData.role).toLowerCase();
    
    console.log("Role nhận được là:", role);
    
    // Kiểm tra: Nếu là 'admin' hoặc số '1' thì điều hướng sang admin
    if (role === 'admin' || role === '1') {
      console.log("Đang điều hướng tới Admin Dashboard...");
      navigate('/admin/dashboard', { replace: true }); 
    } else {
      console.log("Đang điều hướng tới Employee Dashboard...");
      navigate('/employee/dashboard', { replace: true });
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