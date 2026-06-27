import React, { useState, useEffect } from 'react';
import { http } from '../../api/http';
import toast, { Toaster } from 'react-hot-toast';

interface BieuMau {
  MaHoSo: number;
  TenHoSo: string;
  NoiDung: string;
  DuongDan: string;
}

const handleDownload = async (maHoSo: number, tenHoSo: string) => {
  const toastId = toast.loading('Đang xử lý file tải về...');
  try {
    const response = await http.get(`/ho-so-bieu-mau/download/${maHoSo}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const safeFileName = `${tenHoSo.replace(/\s+/g, '_')}_TaiVe`;
    link.setAttribute('download', safeFileName); 
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success('Tải file thành công!', { id: toastId });
  } catch (error) {
    console.error("Lỗi tải file:", error);
    toast.error('Không thể tải file, vui lòng thử lại!', { id: toastId });
  }
};

const handlePreview = (duongDan: string | undefined) => {
  if (!duongDan) {
    toast.error('Biểu mẫu này chưa có file hoặc đường dẫn bị trống!');
    return;
  }
  const fileUrl = duongDan.startsWith('http') 
    ? duongDan 
    : `http://localhost:4000/${duongDan.startsWith('/') ? duongDan.slice(1) : duongDan}`;
  window.open(fileUrl, '_blank');
};

export function EmployeeHoSoBieuMauPage() {
  const [viewingForm, setViewingForm] = useState<BieuMau | null>(null);
  const [forms, setForms] = useState<BieuMau[]>([]);

  useEffect(() => { 
    fetchForms(); 
  }, []);

  const fetchForms = async () => {
    try {
      const response = await http.get('/ho-so-bieu-mau');
      setForms(response.data);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      toast.error('Không thể tải danh sách dữ liệu!');
    }
  };

  const handleDownload = (id: number) => {
    // Gọi đến API download đã định nghĩa trong Controller: @Get(':id/download')
    // Nếu có token, axios interceptor của bạn sẽ tự gắn vào request này
    const downloadUrl = `http://localhost:4000/ho-so-bieu-mau/${id}/download`;
    window.open(downloadUrl, '_blank');
  };

  const styles = {
    container: { padding: '20px', color: '#fff', width: '100%' }, // Đã tối ưu container phẳng
    card: { backgroundColor: '#1e1f2f', borderColor: '#2d2e42', color: '#fff' },
    tableHeader: { color: '#f8cc46', borderBottom: '1px solid #2d2e42', backgroundColor: 'transparent' },
    tableCell: { color: '#c4c4d4', borderBottom: '1px solid #2d2e42', verticalAlign: 'middle', backgroundColor: 'transparent' },
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Màn hình Danh sách */}
      {!viewingForm && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ color: '#f8cc46' }}>Danh sách Biểu mẫu</h2>
          </div>
          <div className="card" style={styles.card}>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-dark table-borderless align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>STT</th>
                      <th style={styles.tableHeader}>Tên hồ sơ</th>
                      <th style={styles.tableHeader}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forms.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4" style={{ color: '#f8cc46' }}>
                          Không có dữ liệu biểu mẫu nào được tìm thấy
                        </td>
                      </tr>
                    ) : (
                      forms.map((form, index) => (
                        <tr key={form.MaHoSo}>
                          <td style={styles.tableCell}>{index + 1}</td>
                          <td style={styles.tableCell}>{form.TenHoSo}</td>
                          <td style={styles.tableCell}>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-info text-white" onClick={() => setViewingForm(form)}>Xem</button>
                              <button className="btn btn-sm btn-success" onClick={() => handleDownload(form.MaHoSo, form.TenHoSo)}>Tải</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Màn hình Chi tiết */}
      {viewingForm && (
        <>
          <div className="d-flex align-items-center mb-4">
            <h2 style={{ color: '#f8cc46' }}>Chi Tiết Biểu Mẫu</h2>
          </div>
          <div className="card" style={styles.card}>
            <div className="card-body">
              <h4 className="mb-4" style={{ color: '#f8cc46' }}>{viewingForm.TenHoSo}</h4>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold text-muted">Nội dung:</div>
                <div className="col-md-9 p-3 rounded" style={{ backgroundColor: '#13141f', border: '1px solid #2d2e42' }}>
                  {viewingForm.NoiDung || <em>Không có mô tả</em>}
                </div>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-3 fw-bold text-muted">Tập tin đính kèm:</div>
                <div className="col-md-9">
                  <div className="d-flex gap-3">
                    <button className="btn btn-info text-white" onClick={() => handlePreview(viewingForm.DuongDan)}>Xem Preview</button>
                    <button className="btn btn-success" onClick={() => handleDownload(viewingForm.MaHoSo, viewingForm.TenHoSo)}>Tải Về</button>
                  </div>
                </div>
              </div>

              <button className="btn btn-secondary" onClick={() => setViewingForm(null)}>Quay Lại</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}