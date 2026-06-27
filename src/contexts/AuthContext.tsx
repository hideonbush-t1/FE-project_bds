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
    authService.profile()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const login = async (maNV: string, matKhau: string) => {
    const res = await authService.login(maNV, matKhau);
    localStorage.setItem('accessToken', res.data.access_token); // Lưu token chuẩn
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    
    navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const refreshProfile = async () => {
    const res = await authService.profile();
    setUser(res.data);
    localStorage.setItem('user', JSON.stringify(res.data));
  };

  const value = useMemo(() => ({ user, loading, login, logout, refreshProfile }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext)!;