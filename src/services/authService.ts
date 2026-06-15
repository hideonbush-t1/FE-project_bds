import { http } from '../api/http';

export type LoginResponse = {
  accessToken: string;
  user: {
    id: number;
    maNV: string;
    hoTen: string;
    email: string;
    soDienThoai?: string | null;
    chucVu: string;
    isAdmin: boolean;
  };
};

export const authService = {
  login(maNV: string, matKhau: string) {
    return http.post<LoginResponse>('/auth/login', { maNV, matKhau });
  },
  profile() {
    return http.get('/auth/profile');
  },
  changePassword(currentPassword: string, newPassword: string) {
    return http.post('/auth/change-password', { currentPassword, newPassword });
  },
};