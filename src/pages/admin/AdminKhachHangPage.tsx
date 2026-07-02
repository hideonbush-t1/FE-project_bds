import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { http } from '../../api/http';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminKhachHangPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathPrefix = location.pathname.startsWith('/admin') ? '/admin' : '/employee';

  const [khachHangList, setKhachHangList] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [loaiKH, setLoaiKH] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  
  const itemsPerPage = 8;

  const styles = {
    container: { padding: '20px', color: '#fff', width: '100%', backgroundColor: '#13141f', minHeight: '100vh' },
    card: { backgroundColor: '#1e1f2f', border: '1px solid #2d2e42', borderRadius: '8px', padding: '20px' },
    textYellow: { color: '#f8cc46' },
    selectDark: { backgroundColor: '#13141f', color: '#fff', border: '1px solid #2d2e42', padding: '10px', borderRadius: '6px' },
    tableHeader: { color: '#f8cc46', borderBottom: '1px solid #2d2e42', padding: '15px', textAlign: 'left' as const },
    tableCell: { color: '#c4c4d4', borderBottom: '1px solid #2d2e42', padding: '15px', verticalAlign: 'middle' as const },
    inputSearch: { backgroundColor: '#13141f', color: '#fff', border: '1px solid #2d2e42', padding: '10px', borderRadius: '6px', flex: 1 },
    btnIcon: { cursor: 'pointer', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '14px', display: 'flex', alignItems: 'center' }
  };

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
      // Kiểm tra phản hồi từ backend xem có phải lỗi xung đột dữ liệu không
      if (error.response && error.response.status === 409) {
        toast.error("Không thể xóa: Khách hàng này đang sở hữu bất động sản!");
      } else {
        toast.error("Lỗi khi xóa khách hàng!");
      }
    }
    finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const totalPages = Math.max(1, Math.ceil(khachHangList.length / itemsPerPage));
  const currentItems = khachHangList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={styles.container}>
      <ToastContainer theme="dark" position="top-right" />
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={styles.textYellow}>📋 QUẢN LÝ KHÁCH HÀNG</h2>
        
        <div style={{ ...styles.card, marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input placeholder="Tìm theo Mã, Tên, SĐT..." onChange={(e) => setSearchKey(e.target.value)} style={styles.inputSearch} />
          <select onChange={(e) => setLoaiKH(e.target.value)} style={styles.selectDark}>
            <option value="">Tất cả loại</option>
            <option value="Cá nhân">Cá nhân</option>
            <option value="Doanh nghiệp">Doanh nghiệp</option>
          </select>
          <button onClick={() => navigate(`${pathPrefix}/khach-hang/create`)} style={{ backgroundColor: '#f8cc46', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Thêm</button>
        </div>

        <div style={styles.card}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr>
                  {['Mã KH', 'Tên', 'Email', 'Loại', 'SĐT', 'Thao tác'].map(h => 
                    <th key={h} style={{ ...styles.tableHeader, textAlign: h === 'Thao tác' ? 'center' : 'left' }}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((kh: any) => (
                  <tr key={kh.id}>
                    <td style={styles.tableCell}>{kh.id}</td>
                    <td style={styles.tableCell}>{kh.hoTen}</td>
                    <td style={styles.tableCell}>{kh.email || '—'}</td>
                    <td style={styles.tableCell}>{kh.loaiKH}</td>
                    <td style={styles.tableCell}>{kh.soDienThoai}</td>
                    <td style={{ ...styles.tableCell, textAlign: 'center', minWidth: '120px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                        <button onClick={() => navigate(`${pathPrefix}/khach-hang/${kh.id}`)} style={{ ...styles.btnIcon, background: '#3498db', color: '#fff' }}>👁️</button>
                        <button onClick={() => navigate(`${pathPrefix}/khach-hang/edit/${kh.id}`)} style={{ ...styles.btnIcon, background: '#f8cc46', color: '#000' }}>✏️</button>
                        <button onClick={() => setDeleteModal({ isOpen: true, id: kh.id })} style={{ ...styles.btnIcon, background: '#e74c3c', color: '#fff' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '5px 15px', background: '#2d2e42', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>◀</button>
            <span style={{ alignSelf: 'center' }}>Trang {currentPage}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '5px 15px', background: '#2d2e42', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>▶</button>
          </div>
        </div>
      </div>
      
      {deleteModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ ...styles.card, maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <h3 style={{ color: '#fff', marginBottom: '20px' }}>Xác nhận xóa?</h3>
            <p style={{ color: '#c4c4d4', marginBottom: '30px' }}>Bạn có chắc chắn muốn xóa khách hàng này không?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteModal({ isOpen: false, id: null })} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #2d2e42', background: 'transparent', color: '#fff' }}>Hủy</button>
              <button onClick={confirmDelete} style={{ padding: '10px 20px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}