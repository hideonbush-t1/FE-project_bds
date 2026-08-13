import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { http } from '../../../api/http';
import { toast, Toaster } from 'react-hot-toast';

export default function ThemKhachHang() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    loaiKH: 'Cá nhân',
    hoTen: '',
    gioiTinh: 'Nam',
    ngaySinh: '',
    diaChi: '',
    soDienThoai: '',
    email: '',
    nhanVienId: '',
    soCMND: ''
  });

  const isRouteAdmin = location.pathname.includes('/admin');
  const backUrl = isRouteAdmin ? '/admin/khach-hang' : '/employee/khach-hang';

  const labelStyle = { fontWeight: 'bold', color: '#fff', marginBottom: '8px', display: 'block' };
  const inputStyle = { 
    width: '100%', 
    padding: '12px', 
    border: '1px solid #3d4149', 
    borderRadius: '4px', 
    color: '#fff', 
    backgroundColor: '#252830', 
    boxSizing: 'border-box' as const 
  };

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    setFormData(prev => ({ ...prev, nhanVienId: user?.maNV || 'NV_CHUA_XAC_DINH' }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Đảm bảo dữ liệu gửi đi sạch sẽ
    const payload = {
      ...formData,
      ngaySinh: formData.ngaySinh ? new Date(formData.ngaySinh).toISOString() : new Date().toISOString()
    };

    try {
      await http.post('/khach-hang', payload);
      toast.success('Thêm khách hàng thành công!');
      setTimeout(() => navigate(backUrl), 1000); 
    } catch (error: any) {
      // Bắt lỗi từ Backend: ConflictException sẽ rơi vào đây
      const errMsg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu!';
      // Nếu Backend trả về mảng lỗi (Validation pipe), lấy lỗi đầu tiên
      const finalMsg = Array.isArray(errMsg) ? errMsg[0] : errMsg;
      toast.error(finalMsg);
    }
  };

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#1a1c23', minHeight: '100vh', display: 'flex', justifyContent: 'center', boxSizing: 'border-box' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#252830', color: '#fff' } }} />
      
      <div style={{ width: '100%', maxWidth: '700px', backgroundColor: '#1a1c23', border: '1px solid #333', padding: '30px', borderRadius: '8px' }}>
        <h2 style={{ color: '#f1c40f', borderBottom: '2px solid #333', paddingBottom: '10px', textAlign: 'center', marginBottom: '30px' }}>
          ➕ TIẾP NHẬN KHÁCH HÀNG
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Mã NV thực hiện:</label>
            <input value={formData.nhanVienId} readOnly style={{...inputStyle, opacity: 0.6, cursor: 'not-allowed'}} />
          </div>

          <div><label style={labelStyle}>Họ Tên (*):</label><input name="hoTen" required value={formData.hoTen} onChange={handleChange} style={inputStyle} /></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><label style={labelStyle}>Ngày sinh (*):</label><input type="date" name="ngaySinh" required value={formData.ngaySinh} onChange={handleChange} style={inputStyle} /></div>
            <div><label style={labelStyle}>Địa chỉ:</label><input name="diaChi" value={formData.diaChi} onChange={handleChange} style={inputStyle} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><label style={labelStyle}>Số CMND/CCCD (*):</label><input name="soCMND" required value={formData.soCMND} onChange={handleChange} style={inputStyle} /></div>
            <div><label style={labelStyle}>Số ĐT (*):</label><input name="soDienThoai" required value={formData.soDienThoai} onChange={handleChange} style={inputStyle} /></div>
          </div>

          <div><label style={labelStyle}>Email:</label><input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} /></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Loại KH:</label>
              <select name="loaiKH" value={formData.loaiKH} onChange={handleChange} style={inputStyle}>
                <option value="Cá nhân">Cá nhân</option>
                <option value="Doanh nghiệp">Doanh nghiệp</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Giới Tính:</label>
              <select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange} style={inputStyle}>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 2, padding: '15px', backgroundColor: '#f1c40f', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>LƯU THÔNG TIN</button>
            <button type="button" onClick={() => navigate(backUrl)} style={{ flex: 1, padding: '15px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>HỦY</button>
          </div>
        </form>
      </div>
    </div>
  );
}