import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../../api/http';
import toast, { Toaster } from 'react-hot-toast';

export default function ThemKhachHang() {
  const navigate = useNavigate();
  const [existingCCCD, setExistingCCCD] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    maKH: 'Đang tải...', 
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

  const labelStyle = { fontWeight: 'bold', color: '#000', marginBottom: '5px', display: 'block' };
  const inputStyle = { width: '100%', padding: '10px', border: '1px solid #333', borderRadius: '4px', color: '#000', backgroundColor: '#fff' };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const res = await http.get('/khach-hang');
        const list = res.data;
        const maxCode = list.reduce((max: number, kh: any) => Math.max(max, parseInt(kh.id?.replace('KH', '') || 0)), 0);
        
        setExistingCCCD(list.map((kh: any) => kh.soCMND).filter(Boolean));
        setFormData(prev => ({
          ...prev,
          maKH: `KH${(maxCode + 1).toString().padStart(3, '0')}`,
          nhanVienId: user.id || 'NV_CHUA_XAC_DINH'
        }));
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (existingCCCD.includes(formData.soCMND.trim())) {
      toast.error("Số CMND/CCCD này đã tồn tại!");
      return;
    }

    // TẠO ĐỐI TƯỢNG MỚI ĐỂ GỬI ĐI (Không dùng delete)
    const submitData: any = {
      maKH: formData.maKH,
      loaiKH: formData.loaiKH,
      hoTen: formData.hoTen,
      gioiTinh: formData.gioiTinh,
      soDienThoai: formData.soDienThoai,
      soCMND: formData.soCMND,
      nhanVienId: formData.nhanVienId,
      diaChi: formData.diaChi
    };

    if (formData.ngaySinh) submitData.ngaySinh = formData.ngaySinh;
    if (formData.email) submitData.email = formData.email;

    try {
      await http.post('/khach-hang', submitData);
      toast.success('Thêm khách hàng thành công!');
      setTimeout(() => navigate('/employee/khach-hang'), 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '20px auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', border: '1px solid #ddd' }}>
      <Toaster position="top-center" />
      <h2 style={{ color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '10px', textAlign: 'center' }}>➕ THÊM KHÁCH HÀNG</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div><label style={labelStyle}>Mã KH:</label><input name="maKH" value={formData.maKH} readOnly style={{...inputStyle, backgroundColor: '#f0f0f0'}} /></div>
          <div><label style={labelStyle}>Mã NV:</label><input name="nhanVienId" value={formData.nhanVienId} readOnly style={{...inputStyle, backgroundColor: '#f0f0f0'}} /></div>
        </div>

        <div><label style={labelStyle}>Họ Tên (*):</label><input name="hoTen" required value={formData.hoTen} onChange={handleChange} style={inputStyle} /></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div><label style={labelStyle}>Số CMND/CCCD (*):</label><input name="soCMND" required value={formData.soCMND} onChange={handleChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>Số ĐT (*):</label><input name="soDienThoai" required value={formData.soDienThoai} onChange={handleChange} style={inputStyle} /></div>
        </div>

        <div><label style={labelStyle}>Email:</label><input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} /></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div><label style={labelStyle}>Loại KH:</label><select name="loaiKH" value={formData.loaiKH} onChange={handleChange} style={inputStyle}><option value="Mua">Mua / Thuê</option><option value="Bán">Bán / Cho thuê</option></select></div>
          <div><label style={labelStyle}>Giới Tính:</label><select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange} style={inputStyle}><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></div>
        </div>

        <label style={labelStyle}>Ngày Sinh:</label>
        <input type="date" name="ngaySinh" value={formData.ngaySinh} onChange={handleChange} style={inputStyle} />

        <button type="submit" style={{ padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>LƯU THÔNG TIN</button>
      </form>
    </div>
  );
}