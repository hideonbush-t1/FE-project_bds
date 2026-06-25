import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { http } from '../../../api/http';
import toast, { Toaster } from 'react-hot-toast';

export default function SuaKhachHang() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    maKH: '',
    hoTen: '',
    loaiKH: 'Mua',
    gioiTinh: 'Nam',
    ngaySinh: '',
    diaChi: '',
    soDienThoai: '',
    soCMND: '',
    email: ''
  });

  useEffect(() => {
    const fetchKhachHang = async () => {
      try {
        const res = await http.get(`/khach-hang/${id}`);
        const kh = res.data;
        
        if (kh) {
          setFormData({
            maKH: kh.id,
            hoTen: kh.hoTen || '',
            loaiKH: kh.loaiKH || 'Mua',
            gioiTinh: kh.gioiTinh || 'Nam',
            ngaySinh: kh.ngaySinh ? kh.ngaySinh.split('T')[0] : '',
            diaChi: kh.diaChi || '',
            soDienThoai: kh.soDienThoai || '',
            soCMND: kh.soCMND || '',
            email: kh.email || ''
          });
        }
      } catch (err) {
        toast.error("Không tìm thấy thông tin khách hàng!");
      }
    };

    if (id) fetchKhachHang();
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      // Loại bỏ mã khách hàng ra khỏi body khi gửi patch để tránh lỗi Prisma
      const { maKH, ...updateData } = formData;
      await http.patch(`/khach-hang/${id}`, updateData);
      toast.success('Cập nhật thành công!');
      setTimeout(() => navigate('/employee/khach-hang'), 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!');
    }
  };

  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' };

  return (
    <div style={{ padding: '40px', backgroundColor: '#1a1c23', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <Toaster />
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#252830', padding: '30px', borderRadius: '8px', color: '#fff' }}>
        <h2 style={{ color: '#f1c40f', textAlign: 'center' }}>✏️ CHỈNH SỬA KHÁCH HÀNG</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* ... (Giữ nguyên các phần input trước đó của bạn) ... */}
          <div>
            <label>Mã KH:</label>
            <input value={formData.maKH} readOnly style={{...inputStyle, opacity: 0.6}} />
          </div>
          <div>
            <label>Tên khách hàng:</label>
            <input name="hoTen" value={formData.hoTen} onChange={(e) => setFormData({...formData, hoTen: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
                <label>Ngày sinh:</label>
                <input type="date" value={formData.ngaySinh} onChange={(e) => setFormData({...formData, ngaySinh: e.target.value})} style={inputStyle} />
            </div>
            <div>
                <label>Giới tính:</label>
                <select value={formData.gioiTinh} onChange={(e) => setFormData({...formData, gioiTinh: e.target.value})} style={inputStyle}>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                </select>
            </div>
          </div>
          <div>
            <label>Địa chỉ:</label>
            <input value={formData.diaChi} onChange={(e) => setFormData({...formData, diaChi: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
                <label>SĐT:</label>
                <input value={formData.soDienThoai} onChange={(e) => setFormData({...formData, soDienThoai: e.target.value})} style={inputStyle} />
            </div>
            <div>
                <label>CMND:</label>
                <input value={formData.soCMND} onChange={(e) => setFormData({...formData, soCMND: e.target.value})} style={inputStyle} />
            </div>
          </div>
          <div>
            <label>Email:</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={inputStyle} />
          </div>

          {/* NÚT ĐIỀU HƯỚNG */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 2, padding: '12px', background: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              LƯU THAY ĐỔI
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/employee/khach-hang')} 
              style={{ flex: 1, padding: '12px', background: '#555', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}
            >
              QUAY LẠI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}