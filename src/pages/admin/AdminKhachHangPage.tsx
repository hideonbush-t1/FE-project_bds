import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { http } from '../../api/http';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; // Dùng chung CSS để đồng bộ giao diện

export default function AdminKhachHangPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathPrefix = location.pathname.startsWith('/admin') ? '/admin' : '/employee';

  const [khachHangList, setKhachHangList] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [loaiKH, setLoaiKH] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Cấu trúc Modal xóa đồng bộ với Nhân Viên
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const fetchKhachHang = async () => {
    try {
      const res = await http.get(`/khach-hang?search=${searchKey}&loaiKH=${loaiKH}`);
      setKhachHangList(res.data);
    } catch (error) { 
      toast.error("Không thể tải danh sách khách hàng!"); 
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchKhachHang, 300);
    return () => clearTimeout(delay);
  }, [searchKey, loaiKH]);

  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      await http.delete(`/khach-hang/${idToDelete}`);
      toast.success("Đã xóa khách hàng thành công!");
      fetchKhachHang();
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        toast.error("Không thể xóa: Khách hàng này đang sở hữu bất động sản!");
      } else {
        toast.error("Lỗi khi xóa khách hàng!");
      }
    } finally {
      setShowDeleteModal(false);
      setIdToDelete(null);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = khachHangList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(khachHangList.length / itemsPerPage));

  return (
    <div className="bds-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bds-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2>Danh sách Khách hàng</h2>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Tìm theo Mã, Tên, SĐT..."
            value={searchKey}
            onChange={(e) => {
              setSearchKey(e.target.value);
              setCurrentPage(1); 
            }}
            style={{ 
              padding: '10px 15px', 
              borderRadius: '6px', 
              border: '1px solid #4a4e69', 
              backgroundColor: '#1a1a2e', 
              color: '#fff', 
              width: '240px',
              outline: 'none'
            }}
          />

          <select 
            value={loaiKH}
            onChange={(e) => {
              setLoaiKH(e.target.value);
              setCurrentPage(1);
            }}
            style={{ 
              padding: '10px 15px', 
              borderRadius: '6px', 
              border: '1px solid #4a4e69', 
              backgroundColor: '#1a1a2e', 
              color: '#fff', 
              outline: 'none'
            }}
          >
            <option value="">Tất cả loại KH</option>
            <option value="Cá nhân">Cá nhân</option>
            <option value="Doanh nghiệp">Doanh nghiệp</option>
          </select>

          <button className="btn-add" onClick={() => navigate(`${pathPrefix}/khach-hang/create`)}>
            + Thêm Khách hàng
          </button>
        </div>
      </div>

      <div className="bds-table-wrapper">
        <table className="bds-table">
          <thead>
            <tr>
              <th>Mã KH</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Loại khách hàng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((kh: any) => (
                <tr key={kh.id}>
                  <td>{kh.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{kh.hoTen}</td>
                  <td>{kh.email || '—'}</td>
                  <td>{kh.soDienThoai}</td>
                  <td>
                    {/* Tái sử dụng class 'status' của css Bất động sản để làm nổi bật */}
                    <span className={`status ${kh.loaiKH === 'Doanh nghiệp' ? 'sold' : 'available'}`}>
                      {kh.loaiKH}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-view" onClick={() => navigate(`${pathPrefix}/khach-hang/${kh.id}`)}>Xem</button>
                    <button className="btn-edit" onClick={() => navigate(`${pathPrefix}/khach-hang/edit/${kh.id}`)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDeleteClick(kh.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  {searchKey ? 'Không tìm thấy khách hàng nào phù hợp' : 'Không có dữ liệu khách hàng'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
            style={{ padding: '8px 16px', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Trang trước
          </button>
          <span style={{ padding: '8px', color: '#D4AF37', fontWeight: 'bold' }}>Trang {currentPage} / {totalPages}</span>
          <button 
            disabled={currentPage >= totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
            style={{ padding: '8px 16px', borderRadius: '4px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
          >
            Trang sau
          </button>
        </div>
      )}

      {/* GIAO DIỆN MODAL XÓA ĐỒNG BỘ */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#1a1a2e',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid #e74c3c',
            width: '400px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ color: '#e74c3c', marginTop: 0, marginBottom: '15px' }}>⚠️ Xác nhận xóa</h3>
            <p style={{ color: '#ecf0f1', marginBottom: '25px', lineHeight: '1.5' }}>
              Bạn có chắc chắn muốn xóa khách hàng <strong>{idToDelete}</strong> không?<br/>
              Hành động này không thể hoàn tác!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button 
                onClick={() => { setShowDeleteModal(false); setIdToDelete(null); }}
                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#95a5a6', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDelete}
                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#e74c3c', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}