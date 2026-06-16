import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface BieuMau {
  MaHoSo: number;
  TenHoSo: string;
  NoiDung: string;
  DuongDan: string;
}

const api = axios.create({
  baseURL: 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
const handleDownload = (duongDan: string | undefined) => {
  if (!duongDan) {
    alert('Biểu mẫu này chưa có file hoặc đường dẫn bị trống!');
    return;
  }

  // Nếu đã là link đầy đủ (http/https), mở luôn. 
  // Nếu không, mặc định coi là link từ server local.
  const fileUrl = duongDan.startsWith('http') 
    ? duongDan 
    : `http://localhost:4000/${duongDan.startsWith('/') ? duongDan.slice(1) : duongDan}`;
  
  window.open(fileUrl, '_blank');
};
export function AdminHoSoBieuMauPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [viewingForm, setViewingForm] = useState<BieuMau | null>(null);
  const [forms, setForms] = useState<BieuMau[]>([]);
  const [formData, setFormData] = useState({ tenHoSo: '', noiDung: '', file: null as File | null });

  useEffect(() => { fetchForms(); }, []);

  const fetchForms = async () => {
  const response = await api.get('/ho-so-bieu-mau'); // Phải là /ho-so-bieu-mau
  setForms(response.data);
};

  const handleDelete = async (maHoSo: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        await api.delete(`/ho-so-bieu-mau/${maHoSo}`);
        fetchForms();
      } catch (error) { alert('Xóa thất bại!'); }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!formData.file) return;

  const submitData = new FormData();
  submitData.append('tenHoSo', formData.tenHoSo); // Đảm bảo key này khớp với @Body() trong NestJS
  submitData.append('noiDung', formData.noiDung);
  submitData.append('file', formData.file);

  try {
    await api.post('/ho-so-bieu-mau', submitData); // Đã sửa đường dẫn khớp với Controller
    alert('Thêm thành công!');
    setFormData({ tenHoSo: '', noiDung: '', file: null });
    setIsCreating(false);
    fetchForms();
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="main-wrapper">
      <main className="main-content" style={{ width: '100%' }}>
        <div className="content-wrapper">
          {/* Danh sách */}
          {!isCreating && !viewingForm && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Quản Lý Biểu Mẫu</h1>
                <button className="btn btn-primary" onClick={() => setIsCreating(true)}>Thêm</button>
              </div>
              <div className="card">
                <div className="card-body">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr><th>STT</th><th>Tên hồ sơ</th><th>Hành động</th></tr>
                    </thead>
                    <tbody>
                      {forms.map((form, index) => (
                        <tr key={form.MaHoSo}>
                          <td>{index + 1}</td>
                          <td>{form.TenHoSo}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-info" onClick={() => setViewingForm(form)}>Xem</button>
                              <button className="btn btn-sm btn-success" onClick={() => handleDownload(form.DuongDan)}>Tải</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(form.MaHoSo)}>Xóa</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Chi tiết */}
          {viewingForm && (
  <>
    <div className="page-title mb-4">
      <h1>Chi Tiết Biểu Mẫu</h1>
    </div>
    <div className="card">
      <div className="card-body">
        <h4 className="text-primary mb-3">{viewingForm.TenHoSo}</h4>
        
        <div className="row mb-3">
          <div className="col-md-3 fw-bold text-muted">Nội dung:</div>
          <div className="col-md-9 p-3 bg-light rounded border">
            {viewingForm.NoiDung || <em>Không có mô tả</em>}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3 fw-bold text-muted">Đường dẫn:</div>
          <div className="col-md-9">
            <a href={viewingForm.DuongDan} target="_blank" rel="noreferrer" className="btn btn-sm btn-link">
              {viewingForm.DuongDan}
            </a>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={() => setViewingForm(null)}>
          Quay Lại Danh Sách
        </button>
      </div>
    </div>
  </>
)}

          {/* Thêm mới */}
          {isCreating && (
  <div className="card p-4">
    <h5 className="mb-3">Thêm Biểu Mẫu Mới</h5>
    <form onSubmit={handleFormSubmit}>
      <div className="mb-2">
        <label className="form-label">Tên hồ sơ</label>
        <input 
          className="form-control" 
          placeholder="Nhập tên hồ sơ..." 
          value={formData.tenHoSo}
          onChange={e => setFormData({...formData, tenHoSo: e.target.value})} 
          required
        />
      </div>

      {/* THÊM CỘT NỘI DUNG Ở ĐÂY */}
      <div className="mb-2">
        <label className="form-label">Nội dung / Mô tả</label>
        <textarea 
          className="form-control" 
          placeholder="Nhập nội dung mô tả..." 
          rows={3}
          value={formData.noiDung}
          onChange={e => setFormData({...formData, noiDung: e.target.value})} 
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Chọn tệp tin</label>
        <input 
          type="file" 
          className="form-control" 
          onChange={e => e.target.files && setFormData({...formData, file: e.target.files[0]})} 
          required
        />
      </div>

      <button type="submit" className="btn btn-primary">Lưu</button>
      <button 
        type="button" 
        className="btn btn-light ms-2" 
        onClick={() => setIsCreating(false)}
      >
        Hủy
      </button>
    </form>
  </div>
)}
        </div>
      </main>
    </div>
  );
}