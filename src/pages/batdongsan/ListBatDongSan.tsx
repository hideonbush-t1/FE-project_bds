import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BatDongSan.css';

const ListBatDongSan = () => {
  const [danhSachBDS, setDanhSachBDS] = useState<any[]>([]);
  
  // State phục vụ phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const navigate = useNavigate();

  // Lấy accessToken từ localStorage
  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    // Kẹp token vào header khi lấy danh sách
    fetch('http://localhost:4000/bat-dong-san', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDanhSachBDS(data);
        } else {
          setDanhSachBDS([]);
        }
      })
      .catch(() => {
        toast.error('Không thể kết nối đến máy chủ Backend!');
        setDanhSachBDS([]);
      });
  }, [token]);

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài sản này?')) {
      // Kẹp token vào header khi gửi lệnh xóa
      fetch(`http://localhost:4000/bat-dong-san/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then((response) => {
          if (response.ok) {
            toast.success('Đã xóa bất động sản thành công!');
            setDanhSachBDS((prev) => prev.filter((item) => item.id !== id));
          } else {
            toast.error('Lỗi khi xóa tài sản hoặc bạn không có quyền thực hiện!');
          }
        })
        .catch(() => {
          toast.error('Lỗi kết nối mạng!');
        });
    }
  };

  // Logic cắt mảng để phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = danhSachBDS.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(danhSachBDS.length / itemsPerPage);

  return (
    <div className="bds-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bds-header">
        <h2>Danh sách Bất động sản</h2>
        <button className="btn-add" onClick={() => navigate('/admin/bat-dong-san/add')}>
          + Thêm Bất động sản
        </button>
      </div>

      <div className="bds-table-wrapper">
        <table className="bds-table">
          <thead>
            <tr>
              <th>Mã BĐS</th>
              <th>Mã KH</th>
              <th>Tiêu đề</th>
              <th>Loại BĐS</th>
              <th>Địa chỉ</th>
              <th>Diện tích</th>
              <th>Giá tiền</th>
              <th>Tình trạng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((bds) => (
                <tr key={bds.id}>
                  <td>{bds.id}</td>
                  <td>{bds.khachHangId}</td>
                  <td>{bds.tieuDe}</td>
                  <td>{bds.loaiBDS}</td>
                  <td>{bds.diaChi}</td>
                  <td>{bds.dienTich} m²</td>
                  <td>{Number(bds.giaTien).toLocaleString('vi-VN')} VNĐ</td>
                  <td>
                    <span className={`status ${bds.tinhTrang === 'Đang bán' || bds.tinhTrang === 'Đang cho thuê' ? 'available' : 'sold'}`}>
                      {bds.tinhTrang}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-view" onClick={() => navigate(`/admin/bat-dong-san/detail/${bds.id}`)}>Xem</button>
                    <button className="btn-edit" onClick={() => navigate(`/admin/bat-dong-san/edit/${bds.id}`)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(bds.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu hoặc bạn chưa đăng nhập</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Điều hướng phân trang */}
      {totalPages > 1 && (
        <div className="pagination" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
            style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Trang trước
          </button>
          <span style={{ padding: '8px' }}>Trang {currentPage} / {totalPages}</span>
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
};

export default ListBatDongSan;