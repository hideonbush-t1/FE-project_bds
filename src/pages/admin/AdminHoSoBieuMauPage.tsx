import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface BieuMau {
  maHoSo: number;
  tenHoSo: string;
  noiDung: string;
  duongDan: string;
}

const api = axios.create({
  baseURL: 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function AdminHoSoBieuMauPage() {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [viewingForm, setViewingForm] = useState<BieuMau | null>(null);
  const [forms, setForms] = useState<BieuMau[]>([]);
  const [formData, setFormData] = useState({
    tenHoSo: '',
    noiDung: '',
    file: null as File | null,
  });

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await api.get('/bieu-mau');
      setForms(response.data);
    } catch (error) {
      console.error('Lỗi lấy danh sách:', error);
      alert('Không thể tải danh sách biểu mẫu. Vui lòng kiểm tra lại kết nối!');
    }
  };

  const handleDownload = (duongDan: string | undefined) => {
    if (!duongDan) {
      alert('Biểu mẫu này chưa có file hoặc đường dẫn bị trống!');
      return;
    }

    // Tự động nhận diện link Cloudinary (bắt đầu bằng http)
    const fileUrl = duongDan.startsWith('http') 
      ? duongDan 
      : `http://localhost:4000/${duongDan.startsWith('/') ? duongDan.slice(1) : duongDan}`;
    
    window.open(fileUrl, '_blank');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.file) {
      alert('Vui lòng chọn file!');
      return;
    }

    const submitData = new FormData();
    submitData.append('tenHoSo', formData.tenHoSo);
    submitData.append('noiDung', formData.noiDung);
    submitData.append('file', formData.file);

    try {
      await api.post('/bieu-mau', submitData);
      alert('Thêm biểu mẫu và tải file lên thành công!');
      setFormData({ tenHoSo: '', noiDung: '', file: null });
      setIsCreating(false);
      fetchForms();
    } catch (error) {
      console.error('Lỗi khi thêm:', error);
      alert('Lỗi thêm biểu mẫu. Vui lòng thử lại!');
    }
  };

  const handleDelete = async (maHoSo: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa biểu mẫu này vĩnh viễn?')) {
      try {
        await api.delete(`/bieu-mau/${maHoSo}`);
        alert(`Đã xóa thành công!`);
        fetchForms();
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
        alert('Xóa thất bại!');
      }
    }
  };

  return (
    <div className="main-wrapper">
      <main className="main-content" style={{ width: '100%' }}>
        <div className="content-wrapper">
          
          {!isCreating && !viewingForm && (
            <>
              <div className="page-title d-flex justify-content-between align-items-center mb-4">
                <div className="page-title-left">
                  <h1>Quản Lý Biểu Mẫu</h1>
                </div>
                <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                  <i className="fas fa-plus"></i> Thêm Biểu Mẫu
                </button>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle">
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th>Tên Biểu Mẫu</th>
                          <th>Mô Tả</th>
                          <th>Hành Động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forms.map((form, index) => (
                          <tr key={form.maHoSo}>
                            <td>{index + 1}</td>
                            <td>{form.tenHoSo}</td>
                            <td className="text-truncate" style={{ maxWidth: '200px' }}>
                              {form.noiDung}
                            </td>
                            <td>
                              <div className="action-buttons gap-2 d-flex">
                                <button onClick={() => setViewingForm(form)} className="btn btn-sm btn-info text-white" title="Xem chi tiết">
                                  <i className="fas fa-eye"></i> Xem
                                </button>
                                <button onClick={() => handleDownload(form.duongDan)} className="btn btn-sm btn-success" title="Tải file">
                                  <i className="fas fa-download"></i> Tải
                                </button>
                                <button onClick={() => handleDelete(form.maHoSo)} className="btn btn-sm btn-danger" title="Xóa">
                                  <i className="fas fa-trash"></i> Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {viewingForm && (
            <>
              <div className="page-title mb-4">
                <div className="page-title-left">
                  <h1>Chi Tiết Biểu Mẫu</h1>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="mb-4">
                    <h4 className="text-primary mb-3">{viewingForm.tenHoSo}</h4>
                    
                    <div className="row mb-3">
                      <div className="col-md-3 fw-bold text-muted">Mã Hồ Sơ:</div>
                      <div className="col-md-9">{viewingForm.maHoSo}</div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-3 fw-bold text-muted">Đường dẫn file:</div>
                      <div className="col-md-9 text-secondary fst-italic">
                        <a href={viewingForm.duongDan} target="_blank" rel="noreferrer">
                           {viewingForm.duongDan}
                        </a>
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-3 fw-bold text-muted">Nội Dung / Mô Tả:</div>
                      <div className="col-md-9 p-3 bg-light rounded border">
                        {viewingForm.noiDung ? viewingForm.noiDung : <em>Không có mô tả</em>}
                      </div>
                    </div>
                  </div>

                  <hr />
                  
                  <div className="form-actions gap-2 d-flex mt-4">
                    <button 
                      type="button" 
                      className="btn btn-success" 
                      onClick={() => handleDownload(viewingForm.duongDan)}
                    >
                      <i className="fas fa-download me-2"></i> Mở File / Tải File
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setViewingForm(null)}>
                      Quay Lại Danh Sách
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {isCreating && (
            <>
              <div className="page-title mb-4">
                <div className="page-title-left">
                  <h1>Thêm Biểu Mẫu</h1>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleFormSubmit}>
                    <div className="form-group mb-3">
                      <label htmlFor="formName" className="form-label">Tên Biểu Mẫu</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="formName" 
                        value={formData.tenHoSo}
                        onChange={(e) => setFormData({...formData, tenHoSo: e.target.value})}
                        required 
                      />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="description" className="form-label">Mô Tả</label>
                      <textarea 
                        className="form-control" 
                        id="description" 
                        rows={4}
                        value={formData.noiDung}
                        onChange={(e) => setFormData({...formData, noiDung: e.target.value})}
                      ></textarea>
                    </div>

                    <div className="form-group mb-4">
                      <label htmlFor="file" className="form-label">Tải File</label>
                      <input 
                        type="file" 
                        className="form-control" 
                        id="file" 
                        onChange={handleFileChange}
                        required 
                      />
                    </div>

                    <div className="form-actions gap-2 d-flex">
                      <button type="submit" className="btn btn-primary">Lưu</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>
                        Quay Lại
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}