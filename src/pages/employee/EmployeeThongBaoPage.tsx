import React, { useState, useEffect } from 'react';
import { http } from '../../api/http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; // Dùng chung CSS của Bất động sản

export function EmployeeThongBaoPage() {
  const [thongBaoList, setThongBaoList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const GOLD_COLOR = '#D4AF37';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await http.get('/thong-bao');
      const list = response.data || [];
      list.sort((a: any, b: any) => b.id - a.id);
      setThongBaoList(list);
    } catch (error) {
      toast.error('Không thể tải danh sách thông báo!');
    }
  };

  const filteredList = thongBaoList.filter((tb) => {
    if (!searchText) return true;
    const lowerSearch = searchText.toLowerCase();
    return (
      (tb.tieuDe && tb.tieuDe.toLowerCase().includes(lowerSearch)) ||
      (tb.noiDung && tb.noiDung.toLowerCase().includes(lowerSearch))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));

  return (
    <div className="bds-container">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      {/* HEADER ĐỒNG BỘ */}
      <div className="bds-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2>Thông báo nội bộ</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Tìm theo tiêu đề, nội dung..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1); 
            }}
            style={{ 
              padding: '10px 15px', borderRadius: '6px', border: '1px solid #4a4e69', 
              backgroundColor: '#1a1a2e', color: '#fff', width: '280px', outline: 'none'
            }}
          />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU ĐỒNG BỘ */}
      <div className="bds-table-wrapper">
        <table className="bds-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th style={{ width: '30%' }}>Tiêu đề</th>
              <th>Nội dung</th>
              <th style={{ width: '150px' }}>Ngày đăng</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((row: any) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 'bold' }}>#{row.id}</td>
                  <td style={{ color: GOLD_COLOR, fontWeight: 'bold' }}>{row.tieuDe}</td>
                  <td style={{ color: '#ccc', lineHeight: '1.5' }}>{row.noiDung}</td>
                  <td style={{ fontWeight: 'bold' }}>{new Date(row.ngayDang).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                  {searchText ? 'Không tìm thấy thông báo nào phù hợp' : 'Không có dữ liệu'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG ĐỒNG BỘ */}
      {totalPages > 1 && (
        <div className="pagination" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '8px 16px', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
            Trang trước
          </button>
          <span style={{ padding: '8px', color: GOLD_COLOR, fontWeight: 'bold' }}>Trang {currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '8px 16px', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}