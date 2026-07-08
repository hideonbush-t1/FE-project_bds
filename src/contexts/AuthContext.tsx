import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

type User = {
  id: string;
  maNV: string;
  hoTen: string;
  email: string;
  soDienThoai?: string | null;
  chucVu: string;
  role: string;
  Role?: string; 
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
        const userData = response.data?.user || response.data?.data || response.data;
        setUser(userData as User);
        localStorage.setItem('user', JSON.stringify(userData));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const login = async (maNV: string, matKhau: string) => {
    const response = await authService.login(maNV, matKhau);
    
    // Lưu token chuẩn từ backend
    localStorage.setItem('accessToken', response.data.access_token);
    
    const userData = response.data.user as User;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Cleanup UI
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    toast.success('Đăng nhập thành công!');

    const role = String(userData?.Role || userData?.role || '').toLowerCase();
    
    // 💡 SỬA Ở ĐÂY: Dùng setTimeout và window.location.href để ép tải lại trang
    setTimeout(() => {
      if (role === 'admin' || role === '1') {
        window.location.href = '/admin/dashboard'; 
      } else {
        window.location.href = '/employee/dashboard';
      }
    }, 1000);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Đăng xuất thành công!');
    setTimeout(() => {
      window.location.href = '/';
    }, 800);
  };

  const refreshProfile = async () => {
    try {
      const response = await authService.profile();
      const userData = response.data?.user || response.data?.data || response.data;
      setUser(userData as User);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      logout();
    }
  };

  const value = useMemo(() => ({ user, loading, login, logout, refreshProfile }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext)!;