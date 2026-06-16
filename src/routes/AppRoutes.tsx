import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import các trang thuộc phân hệ Employee
import EmployeeKhachHangPage from '../pages/employee/EmployeeKhachHangPage';
import ThemKhachHang from '../pages/employee/khachhang/ThemKhachHang';
import ChiTietKhachHang from '../pages/employee/khachhang/ChiTietKhachHang';

// Cứ import hờ các file nhóm đã tạo sẵn để sau này các bạn khác đắp code vào là chạy luôn
import { EmployeeBatDongSanPage } from '../pages/employee/EmployeeBatDongSanPage';
import { EmployeeDashboardPage } from '../pages/employee/EmployeeDashboardPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn mặc định khi vào web sẽ tự chuyển hướng đến trang danh sách khách hàng */}
        <Route path="/" element={<Navigate to="/employee/khach-hang" replace />} />

        {/* Cụm tuyến đường dành cho chức năng của bạn */}
        <Route path="/employee/khach-hang" element={<EmployeeKhachHangPage />} />
        <Route path="/employee/khach-hang/create" element={<ThemKhachHang />} />
        <Route path="/employee/khach-hang/:id" element={<ChiTietKhachHang />} />

        {/* Tuyến đường của các thành viên khác trong nhóm (bạn tạo khung sẵn cho họ) */}
        <Route path="/employee/bat-dong-san" element={<EmployeeBatDongSanPage />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}