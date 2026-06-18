import { http } from '../api/http';

export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;      
    maNV: string;    // Backend đã trả về maNV là tenDangNhap, khớp với cái này!
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