import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; // Dùng chung CSS của Bất động sản

interface NhanVien {
  id: string;
  maNV: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  chucVu: string;
  role?: string;
  Role?: string;
}

export function AdminNhanVienPage() {
  const [danhSachNV, setDanhSachNV] = useState<NhanVien[]>([]);
  const [searchText, setSearchText] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  // 💡 1. THÊM STATE ĐỂ QUẢN LÝ POPUP XÓA
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken') || '';

  // Lấy thông tin người đang đăng nhập từ LocalStorage
  const userRaw = localStorage.getItem('user');
  const currentUser = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    fetch('http://localhost:4000/nhan-vien', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        let list: NhanVien[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data.data && Array.isArray(data.data)) {
          list = data.data; 
        }

        // LỌC: CHỈ ẨN CHÍNH MÌNH, HIỂN THỊ CẢ ADMIN KHÁC
        list = list.filter((nv) => {
          const isMe = currentUser && (
            nv.id === currentUser.id || 
            nv.id === currentUser.maNV || 
            (currentUser.email && nv.email === currentUser.email)
          );
          
          if (isMe) {
            return false; // Nếu là "Tôi" -> Bỏ qua không hiển thị
          }
          return true; // Nếu là người khác (Employee hay Admin) -> Cho hiển thị hết
        });

        // Sắp xếp Mới nhất lên đầu (Theo thứ tự Z -> A của Mã NV)
        list.sort((a: NhanVien, b: NhanVien) => {
          const idA = a.id || a.maNV || '';
          const idB = b.id || b.maNV || '';
          return idB.localeCompare(idA); // Đổi ngược vị trí idB và idA để sắp xếp giảm dần
        });

        setDanhSachNV(list);
      })
      .catch(() => {
        toast.error('Không thể kết nối đến máy chủ Backend!');
        setDanhSachNV([]);
      });
  }, [token]);

  // 💡 2. HÀM GỌI POPUP KHI BẤM NÚT XÓA (Thay thế window.confirm)
  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setShowDeleteModal(true); // Hiển thị Modal
  };

  // 💡 3. HÀM THỰC THI XÓA CHÍNH THỨC KHI BẤM "ĐỒNG Ý"
  const confirmDelete = () => {
    if (!idToDelete) return;

    fetch(`http://localhost:4000/nhan-vien/${idToDelete}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success('Đã xóa nhân viên thành công!');
          setDanhSachNV((prev) => prev.filter((item) => item.id !== idToDelete && item.maNV !== idToDelete));
        } else {
          const err = await response.json();
          toast.error(`Không thể xóa: ${err.message || 'Lỗi dữ liệu ràng buộc'}`);
        }
      })
      .catch(() => toast.error('Lỗi kết nối mạng!'))
      .finally(() => {
        // Dù thành công hay lỗi cũng phải đóng popup và dọn ID
        setShowDeleteModal(false);
        setIdToDelete(null);
      });
  };

  const filteredList = danhSachNV.filter((nv) => {
    if (!searchText) return true;
    const lowerSearch = searchText.toLowerCase();
    return (
      (nv.id && nv.id.toLowerCase().includes(lowerSearch)) ||
      (nv.hoTen && nv.hoTen.toLowerCase().includes(lowerSearch)) ||
      (nv.soDienThoai && nv.soDienThoai.includes(lowerSearch))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  return (
    <div className="bds-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bds-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2>Danh sách Nhân viên</h2>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Tìm theo Mã, Tên, SĐT..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1); 
            }}
            style={{ 
              padding: '10px 15px', 
              borderRadius: '6px', 
              border: '1px solid #4a4e69', 
              backgroundColor: '#1a1a2e', 
              color: '#fff', 
              width: '280px',
              outline: 'none'
            }}
          />
          <button className="btn-add" onClick={() => navigate('/admin/nhan-vien/add')}>
            + Thêm Nhân viên
          </button>
        </div>
      </div>

      <div className="bds-table-wrapper">
        <table className="bds-table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Chức vụ</th>
              <th>Phân quyền</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((nv) => (
                <tr key={nv.id}>
                  <td>{nv.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{nv.hoTen}</td>
                  <td>{nv.email}</td>
                  <td>{nv.soDienThoai}</td>
                  <td>{nv.chucVu}</td>
                  <td>
                    <span className={`status ${String(nv.Role || nv.role).toLowerCase() === 'admin' ? 'sold' : 'available'}`}>
                      {String(nv.Role || nv.role).toLowerCase() === 'admin' ? 'Admin' : 'Nhân viên'}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-view" onClick={() => navigate(`/admin/nhan-vien/detail/${nv.id}`)}>Xem</button>
                    <button className="btn-edit" onClick={() => navigate(`/admin/nhan-vien/edit/${nv.id}`)}>Sửa</button>
                    {/* 💡 4. Đổi sự kiện onClick ở đây */}
                    <button className="btn-delete" onClick={() => handleDeleteClick(nv.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                  {searchText ? 'Không tìm thấy nhân viên nào phù hợp' : 'Không có dữ liệu nhân viên'}
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
            style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Trang trước
          </button>
          <span style={{ padding: '8px', color: '#D4AF37', fontWeight: 'bold' }}>Trang {currentPage} / {totalPages}</span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
            style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Trang sau
          </button>
        </div>
      )}

      {/* 💡 5. UI CỦA POPUP MODAL XÁC NHẬN XÓA */}
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
              Bạn có chắc chắn muốn xóa nhân viên <strong>{idToDelete}</strong> không?<br/>
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