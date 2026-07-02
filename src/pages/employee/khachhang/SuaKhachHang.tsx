import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { http } from '../../../api/http';
import { toast, Toaster } from 'react-hot-toast';

export default function SuaKhachHang() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isRouteAdmin = location.pathname.includes('/admin');
  const backUrl = isRouteAdmin ? '/admin/khach-hang' : '/employee/khach-hang';

  const [formData, setFormData] = useState({
    maKH: '',
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

  // Cấu hình Style đồng bộ với hệ thống
  const theme = {
    background: '#1e1f2f',
    container: '#13141f',
    border: '#2d2e42',
    text: '#c4c4d4',
    accent: '#f8cc46',
    danger: '#dc3545'
  };

  const labelStyle = { fontWeight: 'bold', color: theme.accent, marginBottom: '8px', display: 'block' };
  const inputStyle = { 
    width: '100%', 
    padding: '12px', 
    border: `1px solid ${theme.border}`, 
    borderRadius: '6px', 
    color: '#fff', 
    backgroundColor: theme.container, 
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
      const { maKH, ...updateData } = formData;
      const payload = {
        ...updateData,
        ngaySinh: formData.ngaySinh ? new Date(formData.ngaySinh).toISOString() : new Date().toISOString()
      };

      await http.patch(`/khach-hang/${id}`, payload);
      toast.success('Cập nhật thành công!');
      setTimeout(() => navigate(backUrl), 1000);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!';
      toast.error(Array.isArray(errMsg) ? errMsg[0] : errMsg);
    }
  };

  return (
    <div style={{ padding: '40px 20px', backgroundColor: theme.container, minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: theme.background, color: '#fff' } }} />
      
      <div style={{ width: '100%', maxWidth: '700px', backgroundColor: theme.background, border: `1px solid ${theme.border}`, padding: '30px', borderRadius: '8px' }}>
        <h2 style={{ color: theme.accent, borderBottom: `2px solid ${theme.border}`, paddingBottom: '10px', textAlign: 'center', marginBottom: '30px' }}>
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

          {/* Nút thao tác tối ưu cho Mobile (Xếp chồng) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: theme.accent, color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              LƯU THÔNG TIN
            </button>
            <button type="button" onClick={() => navigate(backUrl)} style={{ width: '100%', padding: '15px', backgroundColor: theme.danger, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              HỦY BỎ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}