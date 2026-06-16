import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

type User = {
  id: string; // Sửa id thành string để khớp với VarChar trong Database
  maNV: string;
  hoTen: string;
  email: string;
  soDienThoai?: string | null;
  chucVu: string;
  role: string; // Đã đổi isAdmin thành role
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

    // Try to verify token by calling profile, but DON'T delete token if it fails
    // Token might be valid even if profile call fails (network issue, backend down, etc.)
    authService
      .profile()
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        // Don't remove token here - let it retry on next request
        // Only clear token on explicit logout
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (maNV: string, matKhau: string) => {
    const response = await authService.login(maNV, matKhau);
    localStorage.setItem('accessToken', response.data.accessToken);
    setUser(response.data.user);
    
    // Đã thay đổi: Dùng role thay vì isAdmin để điều hướng
    const isUserAdmin = response.data.user.role.toLowerCase() === 'admin';
    navigate(isUserAdmin ? '/admin/dashboard' : '/employee/dashboard');
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