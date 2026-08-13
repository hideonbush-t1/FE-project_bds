import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../api/http';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; // Dùng chung CSS của Bất động sản

export default function EmployeeKhachHangPage() {
  const navigate = useNavigate();
  const [khachHangList, setKhachHangList] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [loaiKH, setLoaiKH] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  
  const itemsPerPage = 8; // Tăng lên 8 cho đồng bộ với các trang khác

  // 💡 1. LẤY QUYỀN USER ĐỂ ẨN NÚT VÀ CHỈNH ĐƯỜNG DẪN ĐỘNG
  const userRaw = localStorage.getItem('user');
  const currentUser = userRaw ? JSON.parse(userRaw) : null;
  const isAdmin = currentUser && String(currentUser.Role || currentUser.role).toLowerCase() === 'admin';
  const basePath = isAdmin ? '/admin' : '/employee';
  const GOLD_COLOR = '#D4AF37';

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
      const errorMessage = error.response?.data?.message || "Không thể xóa khách hàng này do có dữ liệu liên quan!";
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
    <div className="bds-container">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      {/* HEADER ĐỒNG BỘ */}
      <div className="bds-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2>Danh sách Khách hàng</h2>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Tìm theo Mã, Tên, SĐT..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            style={{ 
              padding: '10px 15px', borderRadius: '6px', border: '1px solid #4a4e69', 
              backgroundColor: '#1a1a2e', color: '#fff', width: '250px', outline: 'none'
            }}
          />
          
          <select 
            onChange={(e) => setLoaiKH(e.target.value)}
            style={{ 
              padding: '10px 15px', borderRadius: '6px', border: '1px solid #4a4e69', 
              backgroundColor: '#1a1a2e', color: '#fff', outline: 'none'
            }}
          >
            <option value="">Tất cả loại KH</option>
            <option value="Cá nhân">Cá nhân</option>
            <option value="Doanh nghiệp">Doanh nghiệp</option>
          </select>

          <button 
            className="btn-add" 
            onClick={() => navigate(`${basePath}/khach-hang/create`, { state: { nhanVienId: currentUser?.id } })}
          >
            + Tiếp Nhận Khách Hàng
          </button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU ĐỒNG BỘ */}
      <div className="bds-table-wrapper">
        <table className="bds-table">
          <thead>
            <tr>
              <th>Mã KH</th>
              <th>Tên khách hàng</th>
              <th>Loại</th>
              <th>Địa chỉ</th>
              <th>SĐT</th>
              <th>CMND</th>
              <th>NV Quản Lý</th>
              <th className="actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? currentItems.map((kh: any) => (
              <tr key={kh.id}>
                <td style={{ fontWeight: 'bold' }}>{kh.id}</td>
                <td style={{ fontWeight: 'bold', color: GOLD_COLOR }}>{kh.hoTen}</td>
                <td>
                  <span className={`status ${kh.loaiKH === 'Doanh nghiệp' ? 'sold' : 'available'}`}>
                    {kh.loaiKH}
                  </span>
                </td>
                <td style={{ color: '#ccc' }}>{kh.diaChi && kh.diaChi.length > 30 ? `${kh.diaChi.substring(0, 30)}...` : (kh.diaChi || '—')}</td>
                <td style={{ fontWeight: 'bold' }}>{kh.soDienThoai}</td>
                <td>{kh.soCMND || '—'}</td>
                <td style={{ color: '#3498db', fontWeight: 'bold' }}>{kh.nhanVienId || '—'}</td>
                <td className="actions">
                  <button className="btn-view" onClick={() => navigate(`${basePath}/khach-hang/${kh.id}`)}>Xem</button>
                  <button className="btn-edit" onClick={() => navigate(`${basePath}/khach-hang/edit/${kh.id}`)}>Sửa</button>
                  
                  {/* 💡 Chỉ hiển thị nút Xóa nếu là Admin */}
                  {isAdmin && (
                    <button className="btn-delete" onClick={() => setDeleteModal({ isOpen: true, id: kh.id })}>Xóa</button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                  {searchKey || loaiKH ? 'Không tìm thấy khách hàng nào phù hợp' : 'Không có dữ liệu khách hàng'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG ĐỒNG BỘ */}
      {totalPages > 1 && (
        <div className="pagination" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)} 
            style={{ padding: '8px 16px', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Trang trước
          </button>
          <span style={{ padding: '8px', color: GOLD_COLOR, fontWeight: 'bold' }}>
            Trang {currentPage} / {totalPages}
          </span>
          <button 
            disabled={currentPage >= totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)} 
            style={{ padding: '8px 16px', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Trang sau
          </button>
        </div>
      )}
      
      {/* POPUP XÓA ĐỒNG BỘ */}
      {deleteModal.isOpen && isAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#1a1a2e', padding: '30px', borderRadius: '12px', border: '1px solid #e74c3c', width: '400px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: '#e74c3c', marginTop: 0, marginBottom: '15px' }}>⚠️ Xác nhận xóa</h3>
            <p style={{ color: '#ecf0f1', marginBottom: '25px', lineHeight: '1.5' }}>
              Bạn có chắc chắn muốn xóa khách hàng <strong>{deleteModal.id}</strong> không?<br/> 
              Hành động này không thể hoàn tác!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, id: null })} 
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