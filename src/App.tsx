import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navigate, Route, Routes } from 'react-router-dom';

// 💡 IMPORT LỚP BẢO VỆ Ở ĐÂY
import { ProtectedRoute } from './routes/ProtectedRoute';

import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { EmployeeLayout } from './layouts/EmployeeLayout';

// Các trang Public
import { HomePage } from './pages/public/HomePage';
import { NotificationsPage } from './pages/public/NotificationsPage';
import { SupportPage } from './pages/public/SupportPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { SchedulePage } from './pages/public/SchedulePage'; 

// Các trang Admin
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminThongKePage } from './pages/admin/AdminThongKePage';
import { AdminNhanVienPage } from './pages/admin/AdminNhanVienPage';
import AdminKhachHangPage from './pages/admin/AdminKhachHangPage';
import { AdminNhuCauPage } from './pages/admin/AdminNhuCauPage';
import { AdminGiaoDichPage } from './pages/admin/AdminGiaoDichPage';
import { AdminThongBaoPage } from './pages/admin/AdminThongBaoPage';
import { AdminHoSoBieuMauPage } from './pages/admin/AdminHoSoBieuMauPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import AddNhanVien from './pages/admin/AddNhanVien';
import { EditNhanVien } from './pages/admin/EditNhanVien';
import { DetailNhanVien } from './pages/admin/DetailNhanVien';

// Các trang Employee
import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage';
import { EmployeeGiaoDichPage } from './pages/employee/EmployeeGiaoDichPage';
import { EmployeeThongBaoPage } from './pages/employee/EmployeeThongBaoPage';
import { EmployeeHoSoBieuMauPage } from './pages/employee/EmployeeHoSoBieuMauPage';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage';
import { EmployeeNhuCauPage } from './pages/employee/EmployeeNhuCauPage';

// Chức năng Bất động sản (Dùng chung)
import ListBatDongSan from './pages/batdongsan/ListBatDongSan';
import AddBatDongSan from './pages/batdongsan/AddBatDongSan';
import EditBatDongSan from './pages/batdongsan/EditBatDongSan';
import DetailBatDongSan from './pages/batdongsan/DetailBatDongSan';

// Chức năng Khách hàng (Dùng chung)
import EmployeeKhachHangPage from './pages/employee/EmployeeKhachHangPage';
import ThemKhachHang from './pages/employee/khachhang/ThemKhachHang';
import ChiTietKhachHang from './pages/employee/khachhang/ChiTietKhachHang';
import SuaKhachHang from './pages/employee/khachhang/SuaKhachHang';
import { PropertyDetailView } from './pages/public/PropertyDetail';

export function App() {
  return (
    <> 
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        theme="dark" 
      />
      
      <Routes>
        {/* 1. Tuyến đường Public (Không bảo vệ) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/thong-bao" element={<NotificationsPage />} />
          <Route path="/lich-lam-viec" element={<SchedulePage />} />
          <Route path="/ho-tro" element={<SupportPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chi-tiet/:id" element={<PropertyDetailView />} />
        </Route>

        {/* 2. Tuyến đường ADMIN (Bọc ProtectedRoute role="admin") */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="thong-ke" element={<AdminThongKePage />} />
          <Route path="nhan-vien" element={<AdminNhanVienPage />} />
          <Route path="nhan-vien/add" element={<AddNhanVien />} />
          <Route path="nhan-vien/edit/:id" element={<EditNhanVien />} />
          <Route path="nhan-vien/detail/:id" element={<DetailNhanVien />} />
          
          <Route path="khach-hang" element={<AdminKhachHangPage />} />
          <Route path="khach-hang/create" element={<ThemKhachHang />} />
          <Route path="khach-hang/:id" element={<ChiTietKhachHang />} />
          <Route path="khach-hang/edit/:id" element={<SuaKhachHang />} />
          
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

        {/* 3. Tuyến đường EMPLOYEE (Bọc ProtectedRoute role="employee") */}
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
          <Route path="khach-hang/create" element={<ThemKhachHang />} />
          <Route path="khach-hang/:id" element={<ChiTietKhachHang />} />
          <Route path="khach-hang/edit/:id" element={<SuaKhachHang />} />
          
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

        {/* 4. Tự động chuyển hướng */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}