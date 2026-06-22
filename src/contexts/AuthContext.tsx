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
  role: string | number;
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
  // Khởi tạo state từ localStorage để giữ trạng thái khi F5
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
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
        // Bao phủ mọi trường hợp cấu trúc dữ liệu Backend trả về
        const userData = response.data?.user || response.data?.data || response.data;
        setUser(userData as User);
        localStorage.setItem('user', JSON.stringify(userData));
      })
      .catch(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (maNV: string, matKhau: string) => {
    // 1. Gọi API
    const response = await authService.login(maNV, matKhau);
    
    // Lưu token và user
    localStorage.setItem('accessToken', response.data.access_token);
    
    // Lưu user an toàn
    const userData = (response.data.user || response.data) as User;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Chuẩn hóa role để điều hướng
    const role = String(userData?.role || '').toLowerCase();
    
    // Dọn dẹp DOM (loại bỏ màn đen modal nếu có)
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    
    // Điều hướng
    if (role === 'admin' || role === '1') {
      navigate('/admin/dashboard', { replace: true }); 
    } else {
      navigate('/employee/dashboard', { replace: true });
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const refreshProfile = async () => {
    const response = await authService.profile();
    const userData = response.data?.user || response.data?.data || response.data;
    setUser(userData as User);
    localStorage.setItem('user', JSON.stringify(userData));
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