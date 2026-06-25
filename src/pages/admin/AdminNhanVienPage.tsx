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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    fetch('http://localhost:4000/nhan-vien', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data.data && Array.isArray(data.data)) {
          list = data.data; 
        }

        // 💡 BÍ QUYẾT LÀ ĐOẠN NÀY: Sắp xếp mảng theo thứ tự Mã NV (id) tăng dần
        list.sort((a: NhanVien, b: NhanVien) => {
          const idA = a.id || a.maNV || '';
          const idB = b.id || b.maNV || '';
          return idA.localeCompare(idB);
        });

        setDanhSachNV(list);
      })
      .catch(() => {
        toast.error('Không thể kết nối đến máy chủ Backend!');
        setDanhSachNV([]);
      });
  }, [token]);

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      fetch(`http://localhost:4000/nhan-vien/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then((response) => {
          if (response.ok) {
            toast.success('Đã xóa nhân viên thành công!');
            setDanhSachNV((prev) => prev.filter((item) => item.id !== id));
          } else {
            toast.error('Lỗi khi xóa tài khoản hoặc bạn không có quyền!');
          }
        })
        .catch(() => toast.error('Lỗi kết nối mạng!'));
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = danhSachNV.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(danhSachNV.length / itemsPerPage);

  return (
    <div className="bds-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bds-header">
        <h2>Danh sách Nhân viên</h2>
        <button className="btn-add" onClick={() => navigate('/admin/nhan-vien/add')}>
          + Thêm Nhân viên
        </button>
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
                    <button className="btn-delete" onClick={() => handleDelete(nv.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu nhân viên</td>
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
    </div>
  );
}