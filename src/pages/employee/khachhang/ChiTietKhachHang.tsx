import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { http } from '../../../api/http';

export default function ChiTietKhachHang() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  
  const [khachHang, setKhachHang] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Logic kiểm tra URL để quay lại đúng trang Admin hoặc Employee
  const isRouteAdmin = location.pathname.includes('/admin');
  const backUrl = isRouteAdmin ? '/admin/khach-hang' : '/employee/khach-hang';

  useEffect(() => {
    const fetchChiTiet = async () => {
      if (!id) {
        setError('ID hồ sơ không hợp lệ.');
        setLoading(false);
        return;
      }
      try {
        const res = await http.get(`/khach-hang/${id}`);
        setKhachHang(res.data);
      } catch (error: any) {
        setError('Không thể tải chi tiết hồ sơ.');
      } finally {
        setLoading(false);
      }
    };
    fetchChiTiet();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>⏳ Đang tải...</div>;
  if (error) return <div style={{ padding: '40px', color: '#e74c3c', textAlign: 'center' }}>❌ {error}</div>;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#1a1c23', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#252830', padding: '30px', borderRadius: '8px', border: '1px solid #3d4149', color: '#fff' }}>
        <h2 style={{ color: '#f1c40f', borderBottom: '2px solid #333', paddingBottom: '10px', textAlign: 'center', marginBottom: '25px' }}>
          🔍 CHI TIẾT KHÁCH HÀNG
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[
            { label: 'Mã Khách Hàng', value: khachHang.id },
            { label: 'Họ và tên', value: khachHang.hoTen },
            { label: 'Ngày sinh', value: formatDate(khachHang.ngaySinh) },
            { label: 'Giới tính', value: khachHang.gioiTinh },
            { label: 'Nhu cầu', value: khachHang.loaiKH },
            { label: 'Số điện thoại', value: khachHang.soDienThoai },
            { label: 'Email', value: khachHang.email || 'Chưa cập nhật' },
            { label: 'Số CMND/CCCD', value: khachHang.soCMND || 'Trống' },
            { label: 'Địa chỉ', value: khachHang.diaChi || 'Chưa cập nhật' },
            { label: 'Mã NV quản lý', value: khachHang.nhanVienId || 'Chưa phân công' },
          ].map((item, index) => (
            <div key={index} style={{ display: 'flex', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              <strong style={{ width: '160px', color: '#bdc3c7' }}>{item.label}:</strong>
              <span style={{ color: '#fff', wordBreak: 'break-word' }}>{item.value}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate(backUrl)} 
          style={{ 
            marginTop: '30px', 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#333', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: '0.3s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#444')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#333')}
        >
          ⬅ QUAY LẠI DANH SÁCH
        </button>
      </div>
    </div>
  );
}