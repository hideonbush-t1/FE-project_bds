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
import { AdminGiaoDichPage } from '../pages/admin/AdminGiaoDichPage';
import { AdminThongBaoPage } from '../pages/admin/AdminThongBaoPage';
import { AdminHoSoBieuMauPage } from '../pages/admin/AdminHoSoBieuMauPage';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';
// Lưu ý: Đã xóa AdminNhuCauPage

// ================== EMPLOYEE PAGES ==================
import { EmployeeDashboardPage } from '../pages/employee/EmployeeDashboardPage';
import { EmployeeBatDongSanPage } from '../pages/employee/EmployeeBatDongSanPage';
import { EmployeeGiaoDichPage } from '../pages/employee/EmployeeGiaoDichPage';
import { EmployeeThongBaoPage } from '../pages/employee/EmployeeThongBaoPage';
import { EmployeeHoSoBieuMauPage } from '../pages/employee/EmployeeHoSoBieuMauPage';
import { EmployeeProfilePage } from '../pages/employee/EmployeeProfilePage';

// --- CỤM TÍNH NĂNG KHÁCH HÀNG ---
import EmployeeKhachHangPage from '../pages/employee/EmployeeKhachHangPage';
import ThemKhachHang from '../pages/employee/khachhang/ThemKhachHang';
import ChiTietKhachHang from '../pages/employee/khachhang/ChiTietKhachHang';
import SuaKhachHang from '../pages/employee/khachhang/SuaKhachHang';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. PUBLIC ROUTES */}
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
          <Route path="giao-dich" element={<AdminGiaoDichPage />} />
          <Route path="thong-bao" element={<AdminThongBaoPage />} />
          <Route path="ho-so-bieu-mau" element={<AdminHoSoBieuMauPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* 3. EMPLOYEE ROUTES */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route path="dashboard" element={<EmployeeDashboardPage />} />
          
          {/* Cụm Khách Hàng */}
          <Route path="khach-hang" element={<EmployeeKhachHangPage />} />
          <Route path="khach-hang/create" element={<ThemKhachHang />} />
          <Route path="khach-hang/:id" element={<ChiTietKhachHang />} />
          <Route path="khach-hang/edit/:id" element={<SuaKhachHang />} />

          {/* Cụm Nhu Cầu đã được xóa bỏ hoàn toàn */}

          <Route path="bat-dong-san" element={<EmployeeBatDongSanPage />} />
          <Route path="giao-dich" element={<EmployeeGiaoDichPage />} />
          <Route path="thong-bao" element={<EmployeeThongBaoPage />} />
          <Route path="ho-so-bieu-mau" element={<EmployeeHoSoBieuMauPage />} />
          <Route path="profile" element={<EmployeeProfilePage />} />
        </Route>

        {/* 4. FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}