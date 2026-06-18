import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { EmployeeLayout } from './layouts/EmployeeLayout';
import { HomePage } from './pages/public/HomePage';
import { NotificationsPage } from './pages/public/NotificationsPage';
import { SupportPage } from './pages/public/SupportPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { SchedulePage } from './pages/public/SchedulePage'; 

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminNhanVienPage } from './pages/admin/AdminNhanVienPage';
import { AdminKhachHangPage } from './pages/admin/AdminKhachHangPage';
import { AdminNhuCauPage } from './pages/admin/AdminNhuCauPage';
import { AdminGiaoDichPage } from './pages/admin/AdminGiaoDichPage';
import { AdminThongBaoPage } from './pages/admin/AdminThongBaoPage';
import { AdminHoSoBieuMauPage } from './pages/admin/AdminHoSoBieuMauPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage';
import { EmployeeNhuCauPage } from './pages/employee/EmployeeNhuCauPage';
import { EmployeeGiaoDichPage } from './pages/employee/EmployeeGiaoDichPage';
import { EmployeeThongBaoPage } from './pages/employee/EmployeeThongBaoPage';
import { EmployeeHoSoBieuMauPage } from './pages/employee/EmployeeHoSoBieuMauPage';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage';

// ==========================================================
// 1. IMPORT TỪ CODE MỚI (CHỨC NĂNG BẤT ĐỘNG SẢN)
// ==========================================================
import ListBatDongSan from './pages/batdongsan/ListBatDongSan';
import AddBatDongSan from './pages/batdongsan/AddBatDongSan';
import EditBatDongSan from './pages/batdongsan/EditBatDongSan';
import DetailBatDongSan from './pages/batdongsan/DetailBatDongSan';

// ==========================================================
// 2. IMPORT TỪ CODE CŨ (CHỨC NĂNG KHÁCH HÀNG CỦA BẠN)
// ==========================================================
import EmployeeKhachHangPage from './pages/employee/EmployeeKhachHangPage';
import ThemKhachHang from './pages/employee/khachhang/ThemKhachHang';
import ChiTietKhachHang from './pages/employee/khachhang/ChiTietKhachHang';

export function App() {
  return (
    <Routes>
      {/* 1. Các tuyến đường công khai (Public) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/thong-bao" element={<NotificationsPage />} />
        <Route path="/lich-lam-viec" element={<SchedulePage />} />
        <Route path="/ho-tro" element={<SupportPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 2. Các tuyến đường cho Quản trị viên (Admin) */}
      <Route
        path="/admin"
        element={<AdminLayout />} 
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="nhan-vien" element={<AdminNhanVienPage />} />
        <Route path="khach-hang" element={<AdminKhachHangPage />} />
        
        {/* Quản lý Bất Động Sản (Từ code mới) */}
        <Route path="bat-dong-san" element={<ListBatDongSan />} />
        <Route path="bat-dong-san/add" element={<AddBatDongSan />} />
        <Route path="bat-dong-san/edit/:id" element={<EditBatDongSan />} />
        <Route path="bat-dong-san/detail/:id" element={<DetailBatDongSan />} />

        <Route path="nhu-cau" element={<AdminNhuCauPage />} />
        <Route path="giao-dich" element={<AdminGiaoDichPage />} />
        <Route path="thong-bao" element={<AdminThongBaoPage />} />
        <Route path="ho-so-bieu-mau" element={<AdminHoSoBieuMauPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      {/* 3. Các tuyến đường cho Nhân viên (Employee) - Tạm gỡ ProtectedRoute */}
      <Route
        path="/employee"
        element={<EmployeeLayout />}
      >
        <Route path="dashboard" element={<EmployeeDashboardPage />} />
        
        {/* Khu vực xử lý tính năng Quản lý Khách hàng của bạn (Từ code cũ) */}
        <Route path="khach-hang" element={<EmployeeKhachHangPage />} />
        <Route path="khach-hang/create" element={<ThemKhachHang />} />
        <Route path="khach-hang/:id" element={<ChiTietKhachHang />} />
        
        {/* Khu vực xử lý tính năng Quản lý Bất động sản (Từ code mới) */}
        <Route path="bat-dong-san" element={<ListBatDongSan />} />
        <Route path="bat-dong-san/add" element={<AddBatDongSan />} />
        <Route path="bat-dong-san/edit/:id" element={<EditBatDongSan />} />
        <Route path="bat-dong-san/detail/:id" element={<DetailBatDongSan />} />

        <Route path="nhu-cau" element={<EmployeeNhuCauPage />} />
        <Route path="giao-dich" element={<EmployeeGiaoDichPage />} />
        <Route path="thong-bao" element={<EmployeeThongBaoPage />} />
        <Route path="ho-so-bieu-mau" element={<EmployeeHoSoBieuMauPage />} />
        <Route path="profile" element={<EmployeeProfilePage />} />
      </Route>

      {/* 4. Tự động chuyển hướng về trang chủ nếu gõ sai URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}