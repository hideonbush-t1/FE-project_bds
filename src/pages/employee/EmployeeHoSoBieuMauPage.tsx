import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; // Dùng chung CSS hệ thống
import { http } from '../../api/http';
import { FileTextOutlined, FileOutlined } from '@ant-design/icons';

interface BieuMau {
  MaHoSo: number;
  TenHoSo: string;
  NoiDung: string;
  DuongDan: string;
}

export function EmployeeHoSoBieuMauPage() {
  const [forms, setForms] = useState<BieuMau[]>([]);
  const [viewingForm, setViewingForm] = useState<BieuMau | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const GOLD_COLOR = '#D4AF37';

  useEffect(() => { 
    fetchForms(); 
  }, []);

  const fetchForms = async () => {
    try {
      const response = await http.get('/ho-so-bieu-mau');
      setForms(response.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách biểu mẫu!');
    }
  };

  const handleDownload = async (maHoSo: number, tenHoSo: string) => {
    const toastId = toast.loading('Đang tải file...');
    try {
      const response = await http.get(`/ho-so-bieu-mau/download/${maHoSo}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tenHoSo.replace(/\s+/g, '_')}_TaiVe`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.update(toastId, { render: 'Tải file thành công!', type: 'success', isLoading: false, autoClose: 3000 });
    } catch (error) {
      toast.update(toastId, { render: 'Tải file thất bại!', type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  const handlePreview = (duongDan: string | undefined) => {
    if (!duongDan) return toast.error('Đường dẫn trống!');
    const fileUrl = duongDan.startsWith('http') ? duongDan : `http://localhost:4000/${duongDan.startsWith('/') ? duongDan.slice(1) : duongDan}`;
    window.open(fileUrl, '_blank');
  };

  const filteredList = forms.filter(f => f.TenHoSo.toLowerCase().includes(searchText.toLowerCase()));
  const currentItems = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));

  return (
    <div className="bds-container">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      {/* HEADER ĐỒNG BỘ */}
      <div className="bds-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2>Danh sách Biểu mẫu</h2>
        <input 
          type="text" placeholder="Tìm theo tên hồ sơ..." value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
          style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #4a4e69', backgroundColor: '#1a1a2e', color: '#fff', width: '280px', outline: 'none' }}
        />
      </div>

      {!viewingForm ? (
        <>
          <div className="bds-table-wrapper">
            <table className="bds-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th style={{ width: '40%' }}>Tên hồ sơ</th>
                  <th className="actions">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((form, index) => (
                  <tr key={form.MaHoSo}>
                    <td style={{ fontWeight: 'bold' }}>#{index + 1}</td>
                    <td style={{ color: GOLD_COLOR, fontWeight: 'bold' }}>{form.TenHoSo}</td>
                    <td className="actions">
                      <button className="btn-view" onClick={() => setViewingForm(form)}>Xem</button>
                      <button style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} 
                              onClick={() => handleDownload(form.MaHoSo, form.TenHoSo)}>Tải</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Trước</button>
              <span style={{ color: GOLD_COLOR, fontWeight: 'bold' }}>Trang {currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Sau</button>
            </div>
          )}
        </>
      ) : (
        <div style={{ backgroundColor: '#1a1a2e', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
          <h2 style={{ color: GOLD_COLOR, marginBottom: '20px' }}>{viewingForm.TenHoSo}</h2>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#aaa', fontWeight: 'bold' }}>Mô tả:</p>
            <div style={{ padding: '15px', backgroundColor: '#16213e', borderRadius: '6px', color: '#fff', whiteSpace: 'pre-wrap' }}>
              {viewingForm.NoiDung || 'Không có mô tả.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-view" onClick={() => handlePreview(viewingForm.DuongDan)}>
              <FileTextOutlined /> Xem Preview
            </button>
            <button style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} 
                    onClick={() => handleDownload(viewingForm.MaHoSo, viewingForm.TenHoSo)}>
              <FileOutlined /> Tải về máy
            </button>
            <button className="btn-delete" style={{ backgroundColor: '#7f8c8d' }} onClick={() => setViewingForm(null)}>Quay lại</button>
          </div>
        </div>
      )}
    </div>
  );
}