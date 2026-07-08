import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BatDongSan.css';

const ListBatDongSan = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [danhSachBDS, setDanhSachBDS] = useState<any[]>([]);
  const itemsPerPage = 5; 

  const currentPage = Number(searchParams.get('page')) || 1;
  const filters = {
    loaiBDS: searchParams.get('loaiBDS') || '',
    viTri: searchParams.get('viTri') || '',
    diaChi: searchParams.get('diaChi') || '',
    giaMin: searchParams.get('giaMin') || '',
    giaMax: searchParams.get('giaMax') || '',
    huong: searchParams.get('huong') || ''
  };

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken') || '';

  // 💡 1. LẤY QUYỀN USER ĐỂ ẨN NÚT & ĐIỀU HƯỚNG ĐỘNG
  const userRaw = localStorage.getItem('user');
  const currentUser = userRaw ? JSON.parse(userRaw) : null;
  const isAdmin = currentUser && String(currentUser.Role || currentUser.role).toLowerCase() === 'admin';
  const basePath = isAdmin ? '/admin' : '/employee'; // Điều hướng đúng luồng

  const fetchBDS = useCallback(() => {
    const hasFilters = filters.loaiBDS || filters.viTri || filters.diaChi || filters.giaMin || filters.giaMax || filters.huong;
    
    let url = 'http://localhost:4000/bat-dong-san';

    if (hasFilters) {
      const queryParams = new URLSearchParams();
      if (filters.loaiBDS) queryParams.append('loaiBDS', filters.loaiBDS);
      if (filters.viTri) queryParams.append('viTri', filters.viTri);
      if (filters.diaChi) queryParams.append('diaChi', filters.diaChi);
      if (filters.giaMin) queryParams.append('giaMin', filters.giaMin);
      if (filters.giaMax) queryParams.append('giaMax', filters.giaMax);
      if (filters.huong) queryParams.append('huong', filters.huong);
      
      url = `http://localhost:4000/bat-dong-san/search?${queryParams.toString()}`;
    }

    fetch(url, {
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
  }, [filters.loaiBDS, filters.viTri, filters.diaChi, filters.giaMin, filters.giaMax, filters.huong, token]);

  useEffect(() => {
    fetchBDS();
  }, [fetchBDS]);

  const [localFilters, setLocalFilters] = useState(filters);

  // Xử lý lọc thông minh (Quy đổi chuỗi giá trị thành số tiền Min/Max)
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'mucGia') {
      let min = '', max = '';
      if (value === 'duoi-500tr') { max = '500000000'; }
      else if (value === '500tr-1ty') { min = '500000000'; max = '1000000000'; }
      else if (value === '1-3ty') { min = '1000000000'; max = '3000000000'; }
      else if (value === '3-5ty') { min = '3000000000'; max = '5000000000'; }
      else if (value === '5-10ty') { min = '5000000000'; max = '10000000000'; }
      else if (value === '10-50ty') { min = '10000000000'; max = '50000000000'; }
      else if (value === 'tren-50ty') { min = '50000000000'; }

      setLocalFilters(prev => ({ ...prev, giaMin: min, giaMax: max }));
    } else {
      setLocalFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  // Dịch ngược lại từ số tiền ra hiển thị Dropdown
  const getSelectedPrice = (min: string, max: string) => {
    if (!min && max === '500000000') return 'duoi-500tr';
    if (min === '500000000' && max === '1000000000') return '500tr-1ty';
    if (min === '1000000000' && max === '3000000000') return '1-3ty';
    if (min === '3000000000' && max === '5000000000') return '3-5ty';
    if (min === '5000000000' && max === '10000000000') return '5-10ty';
    if (min === '10000000000' && max === '50000000000') return '10-50ty';
    if (min === '50000000000' && !max) return 'tren-50ty';
    return '';
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (localFilters.loaiBDS) params.append('loaiBDS', localFilters.loaiBDS);
    if (localFilters.viTri) params.append('viTri', localFilters.viTri);
    if (localFilters.diaChi) params.append('diaChi', localFilters.diaChi);
    if (localFilters.giaMin) params.append('giaMin', localFilters.giaMin);
    if (localFilters.giaMax) params.append('giaMax', localFilters.giaMax);
    if (localFilters.huong) params.append('huong', localFilters.huong);
    params.set('page', '1');
    
    setSearchParams(params); 
  };

  const handleClearFilter = () => {
    setLocalFilters({ loaiBDS: '', viTri: '', diaChi: '', giaMin: '', giaMax: '', huong: '' });
    setSearchParams(new URLSearchParams()); 
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài sản này?')) {
      fetch(`http://localhost:4000/bat-dong-san/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then((response) => {
          if (response.ok) {
            toast.success('Đã xóa bất động sản thành công!');
            setDanhSachBDS((prev) => prev.filter((item) => item.id !== id));
          } else {
            toast.error('Lỗi khi xóa tài sản hoặc bạn không có quyền thực hiện!');
          }
        })
        .catch(() => toast.error('Lỗi kết nối mạng!'));
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = danhSachBDS.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(danhSachBDS.length / itemsPerPage);

  return (
    <div className="bds-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bds-header">
        <h2>Danh sách Bất động sản</h2>
        {/* 💡 2. Thay thế cứng /admin bằng basePath */}
        <button className="btn-add" onClick={() => navigate(`${basePath}/bat-dong-san/add`)}>
          + Thêm Bất động sản
        </button>
      </div>

      {/* Áp dụng class bds-filter-card và filter-group chuẩn từ file CSS của bạn */}
      <div className="bds-filter-card">
        <div className="filter-group">
          <label>Loại BĐS</label>
          <select name="loaiBDS" value={localFilters.loaiBDS} onChange={handleFilterChange}>
            <option value="">-- Tất cả --</option>
            <option value="Nhà ở">Nhà ở</option>
            <option value="Đất nền">Đất nền</option>
            <option value="Căn hộ chung cư">Căn hộ chung cư</option>
            <option value="Biệt thự">Biệt thự</option>
            <option value="Văn phòng">Văn phòng</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Địa chỉ cụ thể</label>
          <input type="text" name="diaChi" value={localFilters.diaChi} onChange={handleFilterChange} placeholder="Tỉnh, thành, đường..." />
        </div>

        <div className="filter-group">
          <label>Đặc điểm Vị trí</label>
          <input type="text" name="viTri" value={localFilters.viTri} onChange={handleFilterChange} placeholder="Mặt tiền, ngõ..." />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 2, minWidth: '180px' }}>
          <label style={{ fontSize: '13px', color: '#bdc3c7', marginBottom: '6px', fontWeight: '500' }}>Mức giá</label>
          <select 
            name="mucGia" 
            value={getSelectedPrice(localFilters.giaMin, localFilters.giaMax)} 
            onChange={handleFilterChange} 
            style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#2d3436', color: 'white', border: '1px solid #4a5459', outline: 'none' }}
          >
            <option value="">-- Tất cả mức giá --</option>
            <option value="duoi-500tr">Dưới 500 triệu</option>
            <option value="500tr-1ty">500 triệu - 1 tỷ</option>
            <option value="1-3ty">1 tỷ - 3 tỷ</option>
            <option value="3-5ty">3 tỷ - 5 tỷ</option>
            <option value="5-10ty">5 tỷ - 10 tỷ</option>
            <option value="10-50ty">10 tỷ - 50 tỷ</option>
            <option value="tren-50ty">Trên 50 tỷ</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Hướng</label>
          <select name="huong" value={localFilters.huong} onChange={handleFilterChange}>
            <option value="">-- Tất cả --</option>
            <option value="Đông">Đông</option>
            <option value="Tây">Tây</option>
            <option value="Nam">Nam</option>
            <option value="Bắc">Bắc</option>
            <option value="Đông Nam">Đông Nam</option>
            <option value="Tây Nam">Tây Nam</option>
            <option value="Đông Bắc">Đông Bắc</option>
            <option value="Tây Bắc">Tây Bắc</option>
          </select>
        </div>

        <div className="filter-actions">
          <button className="btn-search" onClick={handleSearch}>Tìm kiếm</button>
          <button className="btn-clear" onClick={handleClearFilter}>Xóa lọc</button>
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
              <th style={{ textAlign: 'right' }}>Giá tiền</th>
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
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#f1c40f' }}>
                    {Number(bds.giaTien).toLocaleString('vi-VN')} đ
                  </td>
                  <td>
                    <span className={`status ${bds.tinhTrang === 'Đang bán' || bds.tinhTrang === 'Đang cho thuê' ? 'available' : 'sold'}`}>
                      {bds.tinhTrang}
                    </span>
                  </td>
                  <td className="actions">
                    {/* 💡 3. Sửa đường dẫn Xem & Sửa thành động theo basePath */}
                    <button className="btn-view" onClick={() => navigate(`${basePath}/bat-dong-san/detail/${bds.id}`)}>Xem</button>
                    <button className="btn-edit" onClick={() => navigate(`${basePath}/bat-dong-san/edit/${bds.id}`)}>Sửa</button>
                    
                    {/* 💡 4. ĐIỀU KIỆN ẨN: Nút Xóa chỉ hiện khi isAdmin = true */}
                    {isAdmin && (
                      <button className="btn-delete" onClick={() => handleDelete(bds.id)}>Xóa</button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: '#bdc3c7' }}>
                  Không tìm thấy tài sản nào phù hợp với điều kiện lọc
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
            Trang trước
          </button>
          <span>Trang {currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default ListBatDongSan;