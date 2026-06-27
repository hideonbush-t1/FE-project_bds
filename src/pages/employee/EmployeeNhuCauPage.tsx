import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../api/http';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EmployeeNhuCauPage() {
  const navigate = useNavigate();
  const [nhuCauList, setNhuCauList] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  
  const itemsPerPage = 5;

  const fetchNhuCau = async () => {
    try {
      const res = await http.get('/nhu-cau/search', { params: { q: searchKey.trim() } });
      setNhuCauList(res.data);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Không thể tải danh sách nhu cầu!");
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchNhuCau, 300);
    return () => clearTimeout(delay);
  }, [searchKey]);

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await http.delete(`/nhu-cau/${deleteModal.id}`);
      toast.success("Xóa thành công!");
      fetchNhuCau();
    } catch (error) {
      toast.error("Không thể xóa nhu cầu!");
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const totalPages = Math.max(1, Math.ceil(nhuCauList.length / itemsPerPage));
  const currentItems = nhuCauList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#1a1c23', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <ToastContainer theme="dark" position="top-right" />
      
      {/* Modal xác nhận xóa */}
      {deleteModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#252830', padding: '20px', borderRadius: '8px', color: '#fff', textAlign: 'center' }}>
            <p>Bạn có chắc chắn muốn xóa nhu cầu này?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
              <button onClick={() => setDeleteModal({ isOpen: false, id: null })} style={{ padding: '8px 16px', cursor: 'pointer' }}>Hủy</button>
              <button onClick={confirmDelete} style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer' }}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '1200px', color: '#fff' }}>
        <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>📋 QUẢN LÝ NHU CẦU KHÁCH HÀNG</h2>
        
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            placeholder="Tìm theo Mã KH, Loại BĐS, Vị trí..." 
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)} 
            style={{ padding: '10px', width: '300px', background: '#252830', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} 
          />
          <button onClick={() => navigate('/employee/nhu-cau/create')} style={{ padding: '10px 20px', backgroundColor: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' }}>
            + Thêm Nhu cầu mới
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#252830', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#333', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Mã NC</th>
              <th style={{ padding: '12px' }}>Mã KH</th>
              <th style={{ padding: '12px' }}>Loại</th>
              <th style={{ padding: '12px' }}>Loại BĐS</th>
              <th style={{ padding: '12px' }}>Vị trí</th>
              <th style={{ padding: '12px' }}>Diện tích</th>
              <th style={{ padding: '12px' }}>Ghi chú</th>
              <th style={{ padding: '12px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? currentItems.map((nc: any) => (
              <tr key={nc.id} style={{ borderBottom: '1px solid #3d4149' }}>
                <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{nc.id}</td>
                <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{nc.khachHangId}</td>
                <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{nc.loaiNC}</td>
                <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{nc.loaiBDS}</td>
                <td style={{ padding: '12px', minWidth: '120px' }}>{nc.viTri}</td>
                <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{nc.dienTichMin} - {nc.dienTichMax}</td>
                
                <td 
                  style={{ padding: '12px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'help' }} 
                  title={nc.ghiChu || ''}
                >
                  {nc.ghiChu || '—'}
                </td>

                <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <button 
  onClick={() => navigate(`/employee/khach-hang/batdongsan?loaiBDS=${nc.loaiBDS}&viTri=${nc.viTri}`)} 
  style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
>
  Khớp BĐS
</button>
                    <button onClick={() => navigate(`/employee/nhu-cau/${nc.id}`)} style={{ background: '#3498db', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Xem</button>
                    <button onClick={() => navigate(`/employee/nhu-cau/edit/${nc.id}`)} style={{ background: '#f1c40f', color: '#000', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Sửa</button>
                    <button onClick={() => setDeleteModal({ isOpen: true, id: nc.id })} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Xóa</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} style={{ padding: '20px', textAlign: 'center' }}>Không tìm thấy dữ liệu</td></tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '5px' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ padding: '8px 15px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>Trước</button>
          <button style={{ padding: '8px 15px', background: '#f1c40f', color: '#000', border: 'none' }}>{currentPage}</button>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={{ padding: '8px 15px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>Sau</button>
        </div>
      </div>
    </div>
  );
}