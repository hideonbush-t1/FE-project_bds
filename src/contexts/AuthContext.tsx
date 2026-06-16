import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';
type User = {
  id: number;
  maNV: string;
  hoTen: string;
  email: string;
  soDienThoai?: string | null;
  chucVu: string;
  isAdmin: boolean;
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
  const response = await fetch('http://localhost:4000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ maNV, matKhau }),
  });

  if (!response.ok) throw new Error('Đăng nhập thất bại');

  const data = await response.json();
  const token = data.access_token;
  localStorage.setItem('accessToken', token);

  const decoded: any = jwtDecode(token);
  setUser(decoded);

  // LOG ĐỂ KIỂM CHỨNG
  console.log('Role của bạn là:', decoded.role); 

  // ĐIỀU HƯỚNG CHÍNH XÁC
  if (decoded.role === 'admin') {
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