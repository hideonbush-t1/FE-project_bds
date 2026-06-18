import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../api/http'; // Đảm bảo đường dẫn import này khớp với project của bạn

export function AdminKhachHangPage() {
  const navigate = useNavigate();
  const [khachHangList, setKhachHangList] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [loaiKH, setLoaiKH] = useState('');
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số dòng trên mỗi trang

  const fetchKhachHang = async () => {
    try {
      let url = `http://localhost:4000/khach-hang`;
      const params = [];
      if (searchKey) params.push(`search=${searchKey}`);
      if (loaiKH) params.push(`loaiKH=${loaiKH}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await http.get(url);
      setKhachHangList(res.data);
      setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      try {
        await http.delete(`http://localhost:4000/khach-hang/${id}`);
        alert("Xóa thành công!");
        fetchKhachHang();
      } catch (error: any) {
        alert("Lỗi khi xóa: " + (error.response?.data?.message || "Không xác định"));
      }
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchKhachHang, 300);
    return () => clearTimeout(delay);
  }, [searchKey, loaiKH]);

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = khachHangList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(khachHangList.length / itemsPerPage);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Đổi màu chữ thành #fff nếu giao diện Admin của bạn đang là nền đen */}
      <h2 style={{ color: '#fff', borderBottom: '2px solid #0070f3', paddingBottom: '10px' }}>
        📋 HỆ THỐNG QUẢN LÝ HỒ SƠ KHÁCH HÀNG (ADMIN)
      </h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input type="text" placeholder="Tìm theo Mã, Tên, SĐT..." value={searchKey} onChange={(e) => setSearchKey(e.target.value)} style={{ padding: '10px', width: '250px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <select value={loaiKH} onChange={(e) => setLoaiKH(e.target.value)} style={{ padding: '10px', borderRadius: '4px' }}>
          <option value="">-- Tất cả --</option>
          <option value="Mua">Nhu cầu Mua/Thuê</option>
          <option value="Bán">Nhu cầu Bán/Cho thuê</option>
        </select>
        {/* Đã sửa route thành /admin/... */}
        <button onClick={() => navigate('/admin/khach-hang/create')} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: 'auto' }}>
          + Tiếp Nhận Khách Hàng
        </button>
      </div>

      <table border={1} cellPadding={12} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#1671cc', color: '#fff' }}>
          <tr>
            <th>Mã KH</th><th>Tên khách hàng</th><th>Loại</th><th>SĐT</th><th>CMND</th><th>NV Quản Lý</th><th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((kh: any) => (
            <tr key={kh.id} style={{ textAlign: 'center' }}>
              <td>{kh.id}</td>
              <td style={{ textAlign: 'left' }}>{kh.hoTen}</td>
              <td>{kh.loaiKH}</td>
              <td>{kh.soDienThoai}</td>
              <td>{kh.soCMND || '—'}</td>
              <td>{kh.nhanVienId || '—'}</td>
              <td>
                {/* Đã sửa route thành /admin/... */}
                <button onClick={() => navigate(`/admin/khach-hang/${kh.id}`)} style={{ marginRight: '5px' }}>Xem</button>
                <button onClick={() => handleDelete(kh.id)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Thanh phân trang */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '5px', justifyContent: 'center' }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button 
            key={i + 1} 
            onClick={() => setCurrentPage(i + 1)}
            style={{ padding: '8px 12px', backgroundColor: currentPage === i + 1 ? '#0070f3' : '#ddd', border: 'none', cursor: 'pointer' }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}