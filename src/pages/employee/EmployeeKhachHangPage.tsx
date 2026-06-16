import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EmployeeKhachHangPage() {
  const navigate = useNavigate();
  const [khachHangList, setKhachHangList] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [loaiKH, setLoaiKH] = useState('');

  const fetchKhachHang = async () => {
    try {
      let url = `http://localhost:4000/khach-hang`;
      const params = [];
      
      if (searchKey) params.push(`search=${searchKey}`);
      if (loaiKH) params.push(`loaiKH=${loaiKH}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const token = localStorage.getItem('accessToken') || '';
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKhachHangList(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khách hàng:", error);
    }
  };

  useEffect(() => {
    fetchKhachHang();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#333', borderBottom: '2px solid #0070f3', paddingBottom: '10px' }}>
        📋 HỆ THỐNG QUẢN LÝ HỒ SƠ KHÁCH HÀNG (SRS 5.5.1)
      </h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Tìm theo Mã KH hoặc Số điện thoại..." 
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          style={{ padding: '10px', width: '320px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select 
          value={loaiKH} 
          onChange={(e) => setLoaiKH(e.target.value)} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">-- Tất cả loại hồ sơ --</option>
          <option value="Mua">Nhu cầu mua / thuê</option>
          <option value="Bán">Nhu cầu bán / cho thuê</option>
        </select>
        <button onClick={fetchKhachHang} style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Tra cứu
        </button>
        <button onClick={() => navigate('/employee/khach-hang/create')} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: 'auto' }}>
          + Tiếp Nhận Khách Hàng
        </button>
      </div>

      <table border={1} cellPadding={12} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f8f9fa' }}>
          <tr>
            <th>Mã KH</th>
            <th>Họ và Tên</th>
            <th>Phân Loại</th>
            <th>Số Điện Thoại</th>
            <th>Số CMND/CCCD</th>
            <th>Địa Chỉ</th>
            <th>Mã NV Quản Lý</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {khachHangList.length > 0 ? (
            khachHangList.map((kh: any) => (
              <tr key={kh.id ?? kh.maKH}>
                <td style={{ fontWeight: 'bold', color: '#0070f3' }}>{kh.maKH ?? kh.id}</td>
                <td>{kh.hoTen}</td>
                <td>{kh.loaiKH}</td>
                <td>{kh.soDienThoai}</td>
                <td>{kh.soCMND}</td>
                <td>{kh.diaChi}</td>
                <td>{kh.nhanVienId || 'Chưa gán'}</td>
                <td>
                  <button onClick={() => navigate(`/employee/khach-hang/${kh.id ?? kh.maKH}`)}>Xem Chi Tiết</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center' }}>Không tìm thấy hồ sơ nào. Bấm nút "Tra cứu" để tải dữ liệu.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}