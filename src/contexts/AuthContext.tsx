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
  role: string; 
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
        // SỬA: Bao phủ mọi trường hợp cấu trúc dữ liệu Backend trả về
        const userData = response.data?.user || response.data?.data || response.data;
        setUser(userData);
      })
      .catch(() => {
        // SỬA: Nếu lấy profile thất bại (do token 'undefined' hoặc hết hạn), xóa luôn token để tránh kẹt
        localStorage.removeItem('accessToken');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (maNV: string, matKhau: string) => {
    const response = await authService.login(maNV, matKhau);
    const token = (response.data as any).access_token || (response.data as any).accessToken;
    localStorage.setItem('accessToken', token); 
    setUser(response.data.user);
    
    const isUserAdmin = String(response.data.user.role).toLowerCase() === 'admin';

    // TUYỆT CHIÊU: Ép trình duyệt chuyển trang cứng và tải lại toàn bộ Template
    // Dòng này tự động "giết" mọi lỗi kẹt Modal và khôi phục thanh cuộn vàng 100%
    window.location.href = isUserAdmin ? '/admin/dashboard' : '/employee/dashboard';
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);

    // Ép tải lại từ đầu để trả lại body sạch sẽ cho Trang chủ
    window.location.href = '/';
  };

  const refreshProfile = async () => {
    const response = await authService.profile();
    const userData = response.data?.user || response.data?.data || response.data;
    setUser(userData);
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