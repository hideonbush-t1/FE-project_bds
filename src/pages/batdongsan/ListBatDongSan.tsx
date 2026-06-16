import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BatDongSan.css';

const ListBatDongSan = () => {
  const [danhSachBDS, setDanhSachBDS] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:4000/bat-dong-san')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDanhSachBDS(data);
        } else {
          setDanhSachBDS([]);
        }
      })
      .catch(() => {
        setDanhSachBDS([]);
      });
  }, []);

  const handleAdd = () => {
    navigate('/admin/bat-dong-san/add');
  };

  const handleView = (id: string) => {
    navigate(`/admin/bat-dong-san/detail/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/bat-dong-san/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đối tượng bất động sản này không?')) {
      fetch(`http://localhost:4000/bat-dong-san/${id}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            alert('Xóa thành công!');
            setDanhSachBDS((prev) => prev.filter((item) => item.id !== id));
          } else {
            alert('Lỗi khi xóa tài sản!');
          }
        })
        .catch(() => {
          alert('Không thể kết nối đến máy chủ!');
        });
    }
  };

  return (
    <div className="bds-container">
      <div className="bds-header">
        <h2>Danh sách Bất động sản</h2>
        <button className="btn-add" onClick={handleAdd}>+ Thêm Bất động sản</button>
      </div>

      <div className="bds-filter-card">
        <div className="filter-group">
          <label>Loại BĐS</label>
          <select>
            <option>Tất cả</option>
            <option>Đất nền</option>
            <option>Nhà ở</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Vị trí</label>
          <select>
            <option>Tất cả</option>
            <option>Trung tâm</option>
            <option>Ngoại ô</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Diện tích (m2)</label>
          <input type="text" placeholder="Nhập diện tích..." />
        </div>
        <div className="filter-group">
          <label>Giá tiền tối đa</label>
          <input type="text" placeholder="VD: 5000000000" />
        </div>
        <div className="filter-action">
          <button className="btn-search">Tìm kiếm</button>
        </div>
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
            {danhSachBDS.length > 0 ? (
              danhSachBDS.map((bds) => (
                <tr key={bds.id}>
                  <td>{bds.id}</td>
                  <td>{bds.khachHangId}</td>
                  <td>{bds.tieuDe}</td>
                  <td>{bds.loaiBDS}</td>
                  <td>{bds.diaChi}</td>
                  <td>{bds.dienTich} m²</td>
                  <td>{Number(bds.giaTien).toLocaleString('vi-VN')} VNĐ</td>
                  <td>
                    <span className={`status ${bds.tinhTrang === 'Có sẵn' || bds.tinhTrang === 'Còn hàng' ? 'available' : 'sold'}`}>
                      {bds.tinhTrang}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-view" onClick={() => handleView(bds.id)}>Xem</button>
                    <button className="btn-edit" onClick={() => handleEdit(bds.id)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(bds.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '20px', color: '#f1c40f' }}>
                  Không có dữ liệu bất động sản nào được tìm thấy
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListBatDongSan;