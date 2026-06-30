import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { http } from '../../api/http';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminKhachHangPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Tự động xác định xem đang ở admin hay employee để làm đường dẫn động
  const pathPrefix = location.pathname.startsWith('/admin') ? '/admin' : '/employee';

  const [khachHangList, setKhachHangList] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [loaiKH, setLoaiKH] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  
  const itemsPerPage = 5;

  const fetchKhachHang = async () => {
    try {
      const res = await http.get(`/khach-hang?search=${searchKey}&loaiKH=${loaiKH}`);
      setKhachHangList(res.data);
      setCurrentPage(1);
    } catch (error) { 
      toast.error("Không thể tải danh sách khách hàng!");
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchKhachHang, 300);
    return () => clearTimeout(delay);
  }, [searchKey, loaiKH]);

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    
    try {
      await http.delete(`/khach-hang/${deleteModal.id}`);
      toast.success("Xóa khách hàng thành công!");
      fetchKhachHang();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Không thể xóa khách hàng này!";
      toast.error(errorMessage);
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const totalPages = Math.max(1, Math.ceil(khachHangList.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = khachHangList.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#1a1c23', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <ToastContainer theme="dark" position="top-right" />
      
      <div style={{ width: '100%', maxWidth: '1200px', color: '#fff' }}>
        <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>📋 QUẢN LÝ KHÁCH HÀNG</h2>
        
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            placeholder="Tìm theo Mã, Tên, SĐT..." 
            onChange={(e) => setSearchKey(e.target.value)} 
            style={{ padding: '10px', width: '250px', background: '#252830', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} 
          />
          
          <select onChange={(e) => setLoaiKH(e.target.value)} style={{ padding: '10px', background: '#252830', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}>
            <option value="">-- Tất cả loại --</option>
            <option value="Cá nhân">Cá nhân</option>
            <option value="Doanh nghiệp">Doanh nghiệp</option>
          </select>

          <button 
            onClick={() => {
               const user = JSON.parse(localStorage.getItem('user') || '{}');
               navigate(`${pathPrefix}/khach-hang/create`, { state: { nhanVienId: user.id } });
            }} 
            style={{ padding: '10px 20px', backgroundColor: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' }}
          >
            + Tiếp Nhận Khách Hàng
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#252830', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#333', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Mã KH</th>
              <th style={{ padding: '15px' }}>Tên khách hàng</th>
              <th style={{ padding: '15px' }}>Loại</th>
              <th style={{ padding: '15px' }}>Địa chỉ</th>
              <th style={{ padding: '15px' }}>SĐT</th>
              <th style={{ padding: '15px' }}>NV Quản Lý</th>
              <th style={{ padding: '15px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? currentItems.map((kh: any) => (
              <tr key={kh.id} style={{ borderBottom: '1px solid #3d4149' }}>
                <td style={{ padding: '15px' }}>{kh.id}</td>
                <td style={{ padding: '15px' }}>{kh.hoTen}</td>
                <td style={{ padding: '15px' }}>{kh.loaiKH}</td>
                <td style={{ padding: '15px', color: '#aaa' }}>{kh.diaChi || '—'}</td>
                <td style={{ padding: '15px' }}>{kh.soDienThoai}</td>
                <td style={{ padding: '15px' }}>{kh.nhanVienId || '—'}</td>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => navigate(`${pathPrefix}/khach-hang/${kh.id}`)} style={{ background: '#3498db', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Xem</button>
                    <button onClick={() => navigate(`${pathPrefix}/khach-hang/edit/${kh.id}`)} style={{ background: '#f1c40f', color: '#000', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Sửa</button>
                    <button onClick={() => setDeleteModal({ isOpen: true, id: kh.id })} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center' }}>Không tìm thấy dữ liệu</td></tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ padding: '8px 15px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>Trước</button>
          <button style={{ padding: '8px 15px', background: '#f1c40f', color: '#000', border: 'none' }}>{currentPage}</button>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={{ padding: '8px 15px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>Sau</button>
        </div>
      </div>
      
      {deleteModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ background: '#252830', padding: '30px', borderRadius: '8px', border: '1px solid #444', color: '#fff' }}>
            <p>Bạn có chắc chắn muốn xóa khách hàng này?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setDeleteModal({ isOpen: false, id: null })} style={{ padding: '8px 15px', cursor: 'pointer' }}>Hủy</button>
              <button onClick={confirmDelete} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}