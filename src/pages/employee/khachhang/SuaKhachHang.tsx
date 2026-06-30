import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { http } from '../../../api/http';
import { toast, Toaster } from 'react-hot-toast';

export default function SuaKhachHang() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Tự động nhận diện quyền qua URL để điều hướng quay lại
  const isRouteAdmin = location.pathname.includes('/admin');
  const backUrl = isRouteAdmin ? '/admin/khach-hang' : '/employee/khach-hang';

  const [formData, setFormData] = useState({
    maKH: 'Đang tải...',
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

  // Styles tái sử dụng
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
    const fetchKhachHang = async () => {
      try {
        const res = await http.get(`/khach-hang/${id}`);
        const kh = res.data;
        
        if (kh) {
          setFormData({
            maKH: kh.id || '',
            hoTen: kh.hoTen || '',
            loaiKH: kh.loaiKH || 'Cá nhân',
            gioiTinh: kh.gioiTinh || 'Nam',
            ngaySinh: kh.ngaySinh ? kh.ngaySinh.split('T')[0] : '',
            diaChi: kh.diaChi || '',
            soDienThoai: kh.soDienThoai || '',
            soCMND: kh.soCMND || '',
            email: kh.email || '',
            nhanVienId: kh.nhanVienId || 'NV_CHUA_XAC_DINH'
          });
        }
      } catch (err) {
        toast.error("Không tìm thấy thông tin khách hàng!");
      }
    };

    if (id) fetchKhachHang();
  }, [id]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      // Bỏ mã KH ra để không can thiệp vào khoá chính trong Database
      const { maKH, ...updateData } = formData;
      const payload = {
        ...updateData,
        ngaySinh: formData.ngaySinh ? new Date(formData.ngaySinh).toISOString() : new Date().toISOString()
      };

      await http.patch(`/khach-hang/${id}`, payload);
      toast.success('Cập nhật thành công!');
      setTimeout(() => navigate(backUrl), 1000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!';
      toast.error(errorMessage);
    }
  };

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#1a1c23', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#252830', color: '#fff' } }} />
      
      <div style={{ width: '100%', maxWidth: '700px', backgroundColor: '#1a1c23', border: '1px solid #333', padding: '30px', borderRadius: '8px' }}>
        <h2 style={{ color: '#f1c40f', borderBottom: '2px solid #333', paddingBottom: '10px', textAlign: 'center', marginBottom: '30px' }}>
          ✏️ CẬP NHẬT THÔNG TIN KHÁCH HÀNG
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><label style={labelStyle}>Mã KH:</label><input value={formData.maKH} readOnly style={{...inputStyle, opacity: 0.6}} /></div>
            <div><label style={labelStyle}>Mã NV Phụ Trách:</label><input value={formData.nhanVienId} readOnly style={{...inputStyle, opacity: 0.6}} /></div>
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
                <option value="Khác">Khác</option>
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