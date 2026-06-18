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
  role?: string; 
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
        // Bao phủ mọi trường hợp cấu trúc dữ liệu Backend trả về
        const userData = response.data?.user || response.data?.data || response.data;
        setUser(userData as User); // Ép kiểu an toàn khi set user
      })
      .catch(() => {
        // Giữ token để thử lại sau
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (maNV: string, matKhau: string) => {
    // 1. Gọi API
    const response = await authService.login(maNV, matKhau);
    
    // Lưu token
    localStorage.setItem('accessToken', response.data.access_token);
    
    // Lưu user an toàn
    const userData = response.data.user as User;
    setUser(userData);
    
    // Chuẩn hóa role
    const role = String(userData?.Role || userData?.role).toLowerCase();
    
    console.log("Role nhận được là:", role);

    // ========================================================
    // 🧹 DIỆT TẬN GỐC MÀN ĐEN BOOTSTRAP TRƯỚC KHI CHUYỂN TRANG
    // ========================================================
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    // ========================================================
    
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

    // Ép tải lại từ đầu để trả lại body sạch sẽ cho Trang chủ
    window.location.href = '/';
  };

  const refreshProfile = async () => {
    const response = await authService.profile();
    const userData = response.data?.user || response.data?.data || response.data;
    setUser(userData as User); // Ép kiểu an toàn khi refresh
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