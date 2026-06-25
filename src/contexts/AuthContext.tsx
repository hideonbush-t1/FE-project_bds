import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

// Định nghĩa kiểu User khớp với phản hồi từ Backend
type User = {
  id: string;
  maNV: string;
  hoTen: string;
  email: string;
  soDienThoai?: string | null;
  chucVu: string;
  role: string;      // Bắt buộc có trường này
  isAdmin: boolean;  // Thêm vào để tránh lỗi thiếu thuộc tính
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
  
  // Khởi tạo state từ localStorage
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [loading, setLoading] = useState(true);

  // Kiểm tra phiên đăng nhập khi load trang
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .profile()
      .then((response) => {
        const userData = response.data?.user || response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (maNV: string, matKhau: string) => {
    // 1. Gọi API login
    const response = await authService.login(maNV, matKhau);
    const data = response.data;

    // 2. Lưu token (đúng tên trường accessToken)
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    
    // 3. Lưu thông tin user
    const userData = data.user as User;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // 4. Dọn dẹp UI (modal backdrop nếu có)
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    
    // 5. Điều hướng dựa trên role
    const role = String(userData?.role || '').toLowerCase();
    if (role === 'admin') {
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
    try {
      const response = await authService.profile();
      const userData = response.data?.user || response.data;
      setUser(userData as User);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      logout();
    }
  };

  const value = useMemo(() => ({ 
    user, 
    loading, 
    login, 
    logout, 
    refreshProfile 
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}