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

  const isRouteAdmin = location.pathname.includes('/admin');
  const pathPrefix = isRouteAdmin ? '/admin' : '/employee';
  const backUrl = `${pathPrefix}/khach-hang`;

  // Cấu hình Style đồng bộ với thiết kế Dark Dashboard
  const styles = {
    container: { padding: '40px 20px', backgroundColor: '#13141f', minHeight: '100vh', display: 'flex', justifyContent: 'center' },
    card: { backgroundColor: '#1e1f2f', border: '1px solid #2d2e42', padding: '30px', borderRadius: '8px', color: '#fff', width: '100%', maxWidth: '600px' },
    textYellow: { color: '#f8cc46', borderBottom: '1px solid #2d2e42', paddingBottom: '15px', textAlign: 'center' as const, marginBottom: '25px' },
    label: { width: '160px', color: '#f8cc46', fontWeight: 'bold' },
    value: { color: '#c4c4d4', wordBreak: 'break-word' as const },
    row: { display: 'flex', borderBottom: '1px solid #2d2e42', padding: '12px 0' },
    btnBase: { padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' as const, border: 'none', textAlign: 'center' as const }
  };

  useEffect(() => {
    const fetchChiTiet = async () => {
      try {
        const res = await http.get(`/khach-hang/${id}`);
        setKhachHang(res.data);
      } catch (error) {
        setError('Không thể tải chi tiết hồ sơ.');
      } finally {
        setLoading(false);
      }
    };
    fetchChiTiet();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>⏳ Đang tải...</div>;
  if (error) return <div style={{ padding: '40px', color: '#e74c3c', textAlign: 'center' }}>❌ {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.textYellow}>🔍 CHI TIẾT KHÁCH HÀNG</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { label: 'Mã KH', value: khachHang.id },
            { label: 'Họ và tên', value: khachHang.hoTen },
            { label: 'Ngày sinh', value: khachHang.ngaySinh ? new Date(khachHang.ngaySinh).toLocaleDateString('vi-VN') : '—' },
            { label: 'Giới tính', value: khachHang.gioiTinh },
            { label: 'Nhu cầu/Loại', value: khachHang.loaiKH },
            { label: 'Số điện thoại', value: khachHang.soDienThoai },
            { label: 'Email', value: khachHang.email || '—' },
            { label: 'CCCD/CMND', value: khachHang.soCMND || '—' },
            { label: 'Địa chỉ', value: khachHang.diaChi || '—' },
            { label: 'NV Quản lý', value: khachHang.nhanVienId || 'Chưa phân công' },
          ].map((item, index) => (
            <div key={index} style={styles.row}>
              <strong style={styles.label}>{item.label}:</strong>
              <span style={styles.value}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Nút thao tác tối ưu (xếp chồng trên Mobile) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
          <button 
            onClick={() => navigate(`${pathPrefix}/khach-hang/edit/${id}`)}
            style={{ ...styles.btnBase, backgroundColor: '#f8cc46', color: '#000' }}
          >
            ✏️ CHỈNH SỬA THÔNG TIN
          </button>
          <button 
            onClick={() => navigate(backUrl)} 
            style={{ ...styles.btnBase, backgroundColor: '#2d2e42', color: '#fff' }}
          >
            ⬅ QUAY LẠI DANH SÁCH
          </button>
        </div>
      </div>
    </div>
  );
}