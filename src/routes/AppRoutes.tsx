import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ================== LAYOUTS ==================
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { EmployeeLayout } from '../layouts/EmployeeLayout';

// ================== PUBLIC PAGES ==================
import { HomePage } from '../pages/public/HomePage';
import { NotificationsPage } from '../pages/public/NotificationsPage';
import { SchedulePage } from '../pages/public/SchedulePage';
import { SupportPage } from '../pages/public/SupportPage';
import { RegisterPage } from '../pages/public/RegisterPage';

// ================== ADMIN PAGES ==================
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminNhanVienPage } from '../pages/admin/AdminNhanVienPage';
import { AdminKhachHangPage } from '../pages/admin/AdminKhachHangPage';
import { AdminBatDongSanPage } from '../pages/admin/AdminBatDongSanPage';
import { AdminNhuCauPage } from '../pages/admin/AdminNhuCauPage';
import { AdminGiaoDichPage } from '../pages/admin/AdminGiaoDichPage';
import { AdminThongBaoPage } from '../pages/admin/AdminThongBaoPage';
import { AdminHoSoBieuMauPage } from '../pages/admin/AdminHoSoBieuMauPage';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';

// ================== EMPLOYEE PAGES ==================
import { EmployeeDashboardPage } from '../pages/employee/EmployeeDashboardPage';
import { EmployeeBatDongSanPage } from '../pages/employee/EmployeeBatDongSanPage';
import { EmployeeNhuCauPage } from '../pages/employee/EmployeeNhuCauPage';
import { EmployeeGiaoDichPage } from '../pages/employee/EmployeeGiaoDichPage';
import { EmployeeThongBaoPage } from '../pages/employee/EmployeeThongBaoPage';
import { EmployeeHoSoBieuMauPage } from '../pages/employee/EmployeeHoSoBieuMauPage';
import { EmployeeProfilePage } from '../pages/employee/EmployeeProfilePage';

// --- TÍNH NĂNG KHÁCH HÀNG (CỦA RIÊNG BẠN) ---
import EmployeeKhachHangPage from '../pages/employee/EmployeeKhachHangPage';
import ThemKhachHang from '../pages/employee/khachhang/ThemKhachHang';
import ChiTietKhachHang from '../pages/employee/khachhang/ChiTietKhachHang';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. PUBLIC ROUTES (Trang chủ và các trang vệ tinh) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/thong-bao" element={<NotificationsPage />} />
          <Route path="/lich-lam-viec" element={<SchedulePage />} />
          <Route path="/ho-tro" element={<SupportPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* 2. ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="nhan-vien" element={<AdminNhanVienPage />} />
          <Route path="khach-hang" element={<AdminKhachHangPage />} />
          <Route path="bat-dong-san" element={<AdminBatDongSanPage />} />
          <Route path="nhu-cau" element={<AdminNhuCauPage />} />
          <Route path="giao-dich" element={<AdminGiaoDichPage />} />
          <Route path="thong-bao" element={<AdminThongBaoPage />} />
          <Route path="ho-so-bieu-mau" element={<AdminHoSoBieuMauPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* 3. EMPLOYEE ROUTES */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route path="dashboard" element={<EmployeeDashboardPage />} />
          
          {/* Cụm tuyến đường dành riêng cho chức năng Khách Hàng của bạn */}
          <Route path="khach-hang" element={<EmployeeKhachHangPage />} />
          <Route path="khach-hang/create" element={<ThemKhachHang />} />
          <Route path="khach-hang/:id" element={<ChiTietKhachHang />} />

          {/* Tuyến đường của các thành viên khác (đã chuẩn bị sẵn khung) */}
          <Route path="bat-dong-san" element={<EmployeeBatDongSanPage />} />
          <Route path="nhu-cau" element={<EmployeeNhuCauPage />} />
          <Route path="giao-dich" element={<EmployeeGiaoDichPage />} />
          <Route path="thong-bao" element={<EmployeeThongBaoPage />} />
          <Route path="ho-so-bieu-mau" element={<EmployeeHoSoBieuMauPage />} />
          <Route path="profile" element={<EmployeeProfilePage />} />
        </Route>

        {/* 4. CHỐNG LỖI MẤT PHƯƠNG HƯỚNG */}
        {/* Nếu người dùng gõ link bậy bạ, tự động đá về Trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}