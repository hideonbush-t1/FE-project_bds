import React, { useState, useEffect } from 'react';
import { http } from '../../api/http';
import toast, { Toaster } from 'react-hot-toast';

interface BieuMau {
  MaHoSo: number;
  TenHoSo: string;
  NoiDung: string;
  DuongDan: string;
}

export function EmployeeHoSoBieuMauPage() {
  const [viewingForm, setViewingForm] = useState<BieuMau | null>(null);
  const [forms, setForms] = useState<BieuMau[]>([]);

  useEffect(() => { 
    fetchForms(); 
  }, []);

  const fetchForms = async () => {
    try {
      // Đảm bảo route này khớp với @Controller('ho-so-bieu-mau') ở Backend
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
    container: { backgroundColor: '#13141f', minHeight: '100vh', padding: '20px', color: '#fff' },
    card: { backgroundColor: '#1e1f2f', borderColor: '#2d2e42', color: '#fff' },
    tableHeader: { color: '#f8cc46', borderBottom: '1px solid #2d2e42', backgroundColor: 'transparent' },
    tableCell: { color: '#c4c4d4', borderBottom: '1px solid #2d2e42', verticalAlign: 'middle', backgroundColor: 'transparent' },
  };

  return (
    <div className="main-wrapper" style={styles.container}>
      <Toaster position="top-right" reverseOrder={false} />

      <main className="main-content" style={{ width: '100%' }}>
        <div className="content-wrapper">
          
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
                                  <button className="btn btn-sm btn-success" onClick={() => handleDownload(form.MaHoSo)}>Tải</button>
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
                  <button className="btn btn-secondary" onClick={() => setViewingForm(null)}>Quay Lại</button>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}