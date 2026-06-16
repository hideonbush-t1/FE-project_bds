import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ChiTietKhachHang() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [khachHang, setKhachHang] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChiTiet = async () => {
      if (!id) {
        setError('ID hồ sơ không hợp lệ.');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('accessToken') || '';
        const res = await axios.get(`http://localhost:4000/khach-hang/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setKhachHang(res.data);
      } catch (error: any) {
        console.error("Lỗi khi tải chi tiết khách hàng:", error);
        const message = error.response?.data?.message || error.message || 'Không thể tải chi tiết hồ sơ.';
        setError(typeof message === 'string' ? message : JSON.stringify(message));
      } finally {
        setLoading(false);
      }
    };
    fetchChiTiet();
  }, [id]);

  if (loading) return <div style={{ padding: '20px', color: '#fff' }}>⏳ Đang tải dữ liệu hồ sơ từ NestJS...</div>;
  if (error) return <div style={{ padding: '20px', color: '#c00' }}>❌ {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', fontFamily: 'Arial, sans-serif', color: '#111' }}>
      <h2 style={{ color: '#111' }}>🔍 CHI TIẾT HỒ SƠ KHÁCH HÀNG (SRS 5.5.3)</h2>
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '6px', backgroundColor: '#fff', lineHeight: '2', color: '#111' }}>
        <p><strong>Mã Khách Hàng:</strong> <span style={{ color: '#0070f3', fontWeight: 'bold' }}>{khachHang.maKH}</span></p> {/* Đã sửa thành maKH viết thường */}
        <p><strong>Họ và tên:</strong> {khachHang.hoTen}</p>
        <p><strong>Nhu cầu:</strong> {khachHang.loaiKH}</p>
        <p><strong>Số điện thoại:</strong> {khachHang.soDienThoai}</p>
        <p><strong>Số CMND/CCCD:</strong> {khachHang.soCMND || 'Trống'}</p>
        <p><strong>Địa chỉ:</strong> {khachHang.diaChi}</p>
        <p><strong>Mã NV quản lý phụ trách:</strong> {khachHang.nhanVienId || 'Chưa phân công'}</p>
      </div>
      <button onClick={() => navigate('/employee/khach-hang')} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
        ⬅ Quay Lại Danh Sách
      </button>
    </div>
  );
}