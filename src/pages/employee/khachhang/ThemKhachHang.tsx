import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ThemKhachHang() {
  const navigate = useNavigate();
  
  // 1. Khởi tạo State chuẩn xác theo các trường Prisma DB yêu cầu
  const [formData, setFormData] = useState({
    maKH: '',
    loaiKH: 'Mua',
    hoTen: '',
    gioiTinh: 'Nam',
    ngaySinh: '',
    diaChi: '',
    soDienThoai: '',
    email: '',
    nhanVienId: '',
    soCMND: ''
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault(); // Ngăn hành vi tải lại trang mặc định gây sập kết nối (Network Error)
    try {
      // 2. Chuẩn hóa dữ liệu tương thích 100% với CreateKhachHangDto của bạn
      const dataToSend: any = {
        maKH: formData.maKH.trim(),
        loaiKH: formData.loaiKH,
        hoTen: formData.hoTen.trim(),
        gioiTinh: formData.gioiTinh,
      };

      // GIẢI QUYẾT LỖI NGÀY SINH (@IsDateString): 
      // Chỉ gửi nếu có giá trị
      if (formData.ngaySinh) dataToSend.ngaySinh = formData.ngaySinh;
      
      if (formData.diaChi.trim()) dataToSend.diaChi = formData.diaChi.trim();
      if (formData.soDienThoai.trim()) dataToSend.soDienThoai = formData.soDienThoai.trim();
      if (formData.email.trim()) dataToSend.email = formData.email.trim();
      if (formData.soCMND.trim()) dataToSend.soCMND = formData.soCMND.trim();
      
      // GIẢI QUYẾT LỖI NHANVIENID (@IsString):
      // Giữ nguyên kiểu CHUỖI (String), chỉ gửi nếu có giá trị
      if (formData.nhanVienId.trim()) dataToSend.nhanVienId = formData.nhanVienId.trim();

      console.log("Dữ liệu thực tế gửi lên NestJS:", dataToSend);

      // 3. Tiến hành gọi API xuống Back-End cổng 4000
      const token = localStorage.getItem('accessToken') || '';
      console.log("Token từ localStorage:", token);
      console.log("Authorization header sẽ gửi:", `Bearer ${token}`);
      
      await axios.post('http://localhost:4000/khach-hang', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Hồ sơ khách hàng đã được tiếp nhận thành công vào Hệ thống!');
      navigate('/employee/khach-hang');
    } catch (error: any) {
      console.error("Chi tiết lỗi từ backend:", error.response?.data);
      console.error("Status code:", error.response?.status);
      console.error("Full error response:", error.response);
      
      // Hiển thị thông báo chi tiết mảng lỗi từ Class-Validator nếu có
      const errorMsg = error.response?.data?.message;
      alert(`Thêm mới thất bại: ${Array.isArray(errorMsg) ? errorMsg.join(', ') : (errorMsg || 'Vui lòng kiểm tra lại kiểu dữ liệu!')}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', fontFamily: 'Arial, sans-serif', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', margin: '20px auto' }}>
      <h2 style={{ color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '10px', marginBottom: '20px' }}>
        ➕ TIẾP NHẬN HỒ SƠ KHÁCH HÀNG MỚI 
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <label style={{ fontWeight: 'bold' }}>Mã Khách Hàng (*):</label>
        <input type="text" name="maKH" required placeholder="Ví dụ: KH009" value={formData.maKH} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

        <label style={{ fontWeight: 'bold' }}>Họ và Tên (*):</label>
        <input type="text" name="hoTen" required placeholder="Nguyễn Văn A" value={formData.hoTen} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

        <label style={{ fontWeight: 'bold' }}>Số Điện Thoại liên hệ (*):</label>
        <input type="text" name="soDienThoai" required placeholder="09xxxxxxxx" value={formData.soDienThoai} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

        <label style={{ fontWeight: 'bold' }}>Loại Yêu Cầu (*):</label>
        <select name="loaiKH" value={formData.loaiKH} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="Mua">Nhu cầu Mua / Thuê Bất Động Sản</option>
          <option value="Bán">Nhu cầu Bán / Cho thuê Bất Động Sản</option>
        </select>

        <label style={{ fontWeight: 'bold' }}>Giới Tính:</label>
        <select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
          <option value="Khác">Khác</option>
        </select>

        <label style={{ fontWeight: 'bold' }}>Ngày Sinh:</label>
        <input type="date" name="ngaySinh" value={formData.ngaySinh} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

        <label style={{ fontWeight: 'bold' }}>Số CMND / CCCD:</label>
        <input type="text" name="soCMND" placeholder="Nhập số CMND" value={formData.soCMND} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

        <label style={{ fontWeight: 'bold' }}>Địa Chi Cư Trú:</label>
        <input type="text" name="diaChi" placeholder="Số nhà, đường, tỉnh thành" value={formData.diaChi} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

        <label style={{ fontWeight: 'bold' }}>Email:</label>
        <input type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

        <label style={{ fontWeight: 'bold' }}>Mã Nhân Viên Phụ Trách Quản Lý (Chuỗi ký tự):</label>
        <input type="text" name="nhanVienId" placeholder="Nhập mã nhân viên quản lý (Ví dụ: NV001 hoặc 1)" value={formData.nhanVienId} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Lưu Vào Hệ Thống
          </button>
          <button type="button" onClick={() => navigate('/employee/khach-hang')} style={{ padding: '12px 24px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Hủy Bỏ
          </button>
        </div>
      </form>
    </div>
  );
}