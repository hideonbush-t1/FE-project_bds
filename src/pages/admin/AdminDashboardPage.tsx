import React, { useState, useEffect } from 'react';
import { http } from '../../api/http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; // Dùng chung CSS của Bất động sản

export function AdminDashboardPage() {
  const [dataList, setDataList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  
  // State Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const GOLD_COLOR = '#D4AF37';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await http.get('/public/bat-dong-san');
      const list = response.data || [];
      // Sắp xếp ID giảm dần (mới nhất lên đầu) nếu có
      list.sort((a: any, b: any) => {
        const idA = a.id ? String(a.id) : '';
        const idB = b.id ? String(b.id) : '';
        return idB.localeCompare(idA);
      });
      setDataList(list);
    } catch (error) {
      toast.error('Lỗi tải dữ liệu Dashboard!');
    }
  };

  // Lọc và Phân trang
  const filteredList = dataList.filter((item) => {
    if (!searchText) return true;
    const lowerSearch = searchText.toLowerCase();
    return (
      (item.tieuDe && item.tieuDe.toLowerCase().includes(lowerSearch)) ||
      (item.diaChi && item.diaChi.toLowerCase().includes(lowerSearch))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));

  return (
    <div className="bds-container">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      {/* HEADER */}
      <div className="bds-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2>Dashboard - Bất Động Sản</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Tìm theo tiêu đề, địa chỉ..."
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

      {/* BẢNG DỮ LIỆU */}
      <div className="bds-table-wrapper">
        <table className="bds-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th style={{ width: '40%' }}>Tin đăng (Tiêu đề)</th>
              <th>Địa chỉ</th>
              <th style={{ width: '180px' }}>Giá tiền</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item: any, index: number) => (
                <tr key={item.id || index}>
                  <td style={{ fontWeight: 'bold' }}>{item.id || '—'}</td>
                  <td style={{ color: GOLD_COLOR, fontWeight: 'bold' }}>{item.tieuDe}</td>
                  <td style={{ color: '#ccc', lineHeight: '1.5' }}>{item.diaChi}</td>
                  <td style={{ fontWeight: 'bold', color: '#2ecc71' }}>
                    {item.giaTien ? `${Number(item.giaTien).toLocaleString('vi-VN')} đ` : 'Thỏa thuận'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                  {searchText ? 'Không tìm thấy tin đăng nào phù hợp' : 'Không có dữ liệu'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG */}
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