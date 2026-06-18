import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { EmployeeLayout } from './layouts/EmployeeLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { HomePage } from './pages/public/HomePage';
import { NotificationsPage } from './pages/public/NotificationsPage';
import { SupportPage } from './pages/public/SupportPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminNhanVienPage } from './pages/admin/AdminNhanVienPage';
import { AdminKhachHangPage } from './pages/admin/AdminKhachHangPage';
import { AdminNhuCauPage } from './pages/admin/AdminNhuCauPage';
import { AdminGiaoDichPage } from './pages/admin/AdminGiaoDichPage';
import { AdminThongBaoPage } from './pages/admin/AdminThongBaoPage';
import { AdminHoSoBieuMauPage } from './pages/admin/AdminHoSoBieuMauPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage';
import { EmployeeKhachHangPage } from './pages/employee/EmployeeKhachHangPage';
import { EmployeeNhuCauPage } from './pages/employee/EmployeeNhuCauPage';
import { EmployeeGiaoDichPage } from './pages/employee/EmployeeGiaoDichPage';
import { EmployeeThongBaoPage } from './pages/employee/EmployeeThongBaoPage';
import { EmployeeHoSoBieuMauPage } from './pages/employee/EmployeeHoSoBieuMauPage';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage';

import ListBatDongSan from './pages/batdongsan/ListBatDongSan';
import AddBatDongSan from './pages/batdongsan/AddBatDongSan';
import EditBatDongSan from './pages/batdongsan/EditBatDongSan';
import DetailBatDongSan from './pages/batdongsan/DetailBatDongSan';

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

  <Route
        path="/admin"
        element={<AdminLayout />} 
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="nhan-vien" element={<AdminNhanVienPage />} />
        <Route path="khach-hang" element={<AdminKhachHangPage />} />
        
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

      <Route
        path="/employee"
        element={
          <ProtectedRoute role="employee">
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<EmployeeDashboardPage />} />
        <Route path="khach-hang" element={<EmployeeKhachHangPage />} />
        
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}