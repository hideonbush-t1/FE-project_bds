import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify'; // 💡 BƯỚC 1: Thêm import thư viện pop-up

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
        const userData = response.data?.user || response.data?.data || response.data;
        setUser(userData as User);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (maNV: string, matKhau: string) => {
    const response = await authService.login(maNV, matKhau);
    localStorage.setItem('accessToken', response.data.access_token);
    
    const userData = response.data.user as User;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    const role = String(userData?.Role || userData?.role).toLowerCase();

    // Diệt màn đen... (giữ nguyên code của bạn)
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.body.style.paddingRight = '0px';
    document.documentElement.style.paddingRight = '0px';
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    // 💡 BƯỚC 2: Bắn pop-up thành công
    toast.success('Đăng nhập thành công!');

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

    // 💡 BƯỚC 3: Bắn pop-up đăng xuất
    toast.success('Đăng xuất thành công!');

    // Delay 0.8 giây để pop-up kịp hiện ra cho người dùng nhìn thấy trước khi F5 trang
    setTimeout(() => {
      window.location.href = '/login'; // Sửa '/' thành '/login' để đá về thẳng trang đăng nhập
    }, 800);
  };

  const refreshProfile = async () => {
    const response = await authService.profile();
    const userData = response.data?.user || response.data?.data || response.data;
    setUser(userData as User);
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