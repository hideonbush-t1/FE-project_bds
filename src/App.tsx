import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { EmployeeLayout } from './layouts/EmployeeLayout';
import { HomePage } from './pages/public/HomePage';
import { NotificationsPage } from './pages/public/NotificationsPage';
import { SupportPage } from './pages/public/SupportPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminNhanVienPage } from './pages/admin/AdminNhanVienPage';
import { AdminKhachHangPage } from './pages/admin/AdminKhachHangPage';
import { AdminBatDongSanPage } from './pages/admin/AdminBatDongSanPage';
import { AdminNhuCauPage } from './pages/admin/AdminNhuCauPage';
import { AdminGiaoDichPage } from './pages/admin/AdminGiaoDichPage';
import { AdminThongBaoPage } from './pages/admin/AdminThongBaoPage';
import { AdminHoSoBieuMauPage } from './pages/admin/AdminHoSoBieuMauPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage';
import { EmployeeBatDongSanPage } from './pages/employee/EmployeeBatDongSanPage';
import { EmployeeNhuCauPage } from './pages/employee/EmployeeNhuCauPage';
import { EmployeeGiaoDichPage } from './pages/employee/EmployeeGiaoDichPage';
import { EmployeeThongBaoPage } from './pages/employee/EmployeeThongBaoPage';
import { EmployeeHoSoBieuMauPage } from './pages/employee/EmployeeHoSoBieuMauPage';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage';

// --- IMPORT MÀN HÌNH CHỨC NĂNG KHÁCH HÀNG ---
import EmployeeKhachHangPage from './pages/employee/EmployeeKhachHangPage';
import ThemKhachHang from './pages/employee/khachhang/ThemKhachHang';
import ChiTietKhachHang from './pages/employee/khachhang/ChiTietKhachHang';
import SuaKhachHang from './pages/employee/khachhang/SuaKhachHang'; // Đã thêm

export function App() {
  return (
    <Routes>
      {/* 1. Các tuyến đường công khai (Public) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 2. Các tuyến đường cho Quản trị viên (Admin) */}
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

      {/* 3. Các tuyến đường cho Nhân viên (Employee) */}
      <Route path="/employee" element={<EmployeeLayout />}>
        <Route path="dashboard" element={<EmployeeDashboardPage />} />
        
        {/* Khu vực quản lý Khách hàng */}
        <Route path="khach-hang" element={<EmployeeKhachHangPage />} />
        <Route path="khach-hang/create" element={<ThemKhachHang />} />
        <Route path="khach-hang/:id" element={<ChiTietKhachHang />} />
        <Route path="khach-hang/edit/:id" element={<SuaKhachHang />} /> {/* Đường dẫn mới */}
        
        <Route path="bat-dong-san" element={<EmployeeBatDongSanPage />} />
        <Route path="nhu-cau" element={<EmployeeNhuCauPage />} />
        <Route path="giao-dich" element={<EmployeeGiaoDichPage />} />
        <Route path="thong-bao" element={<EmployeeThongBaoPage />} />
        <Route path="ho-so-bieu-mau" element={<EmployeeHoSoBieuMauPage />} />
        <Route path="profile" element={<EmployeeProfilePage />} />
      </Route>

      {/* 4. Tự động chuyển hướng */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}