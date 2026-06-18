import { http } from '../api/http';

export type LoginResponse = {
  // Sửa thành access_token để khớp với Backend
  access_token: string; 
  user: {
    id: string;
    maNV: string;
    hoTen: string;
    email: string;
    soDienThoai?: string | null;
    chucVu: string;
    role: string; // PHẢI THÊM TRƯỜNG NÀY VÀO
  };
};

export const authService = {
  login(maNV: string, matKhau: string) {
    // Axios sẽ trả về một object, dữ liệu nằm trong .data
    return http.post<LoginResponse>('/auth/login', { maNV, matKhau });
  },
  profile() {
    // Bạn nên định nghĩa kiểu cho profile() để TypeScript không báo lỗi
    return http.get('/auth/profile');
  },
  changePassword(currentPassword: string, newPassword: string) {
    return http.post('/auth/change-password', { currentPassword, newPassword });
  },
};