import { http } from '../api/http';

export type LoginResponse = {
  access_token: string; // Khớp với Backend
  user: {
    id: string;
    maNV: string;
    hoTen: string;
    email: string;
    soDienThoai?: string | null;
    chucVu: string;
    role: string;
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