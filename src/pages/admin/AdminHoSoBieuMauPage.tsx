import React, { useState, useEffect } from 'react';
import { http } from '../../api/http';
import toast, { Toaster } from 'react-hot-toast'; // Bổ sung import thư viện toast

interface BieuMau {
  MaHoSo: number;
  TenHoSo: string;
  NoiDung: string;
  DuongDan: string;
}

const handleDownload = (duongDan: string | undefined) => {
  if (!duongDan) {
    toast.error('Biểu mẫu này chưa có file hoặc đường dẫn bị trống!');
    return;
  }

  const fileUrl = duongDan.startsWith('http') 
    ? duongDan 
    : `http://localhost:4000/${duongDan.startsWith('/') ? duongDan.slice(1) : duongDan}`;
  
  window.open(fileUrl, '_blank');
};

export function AdminHoSoBieuMauPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [viewingForm, setViewingForm] = useState<BieuMau | null>(null);
  const [editingForm, setEditingForm] = useState<BieuMau | null>(null);
  const [forms, setForms] = useState<BieuMau[]>([]);
  const [formData, setFormData] = useState({ tenHoSo: '', noiDung: '', file: null as File | null });

  useEffect(() => { fetchForms(); }, []);

  const fetchForms = async () => {
    try {
      const response = await http.get('/ho-so-bieu-mau');
      setForms(response.data);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      toast.error('Không thể tải danh sách dữ liệu!');
    }
  };

  const handleDelete = async (maHoSo: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      const toastId = toast.loading('Đang xử lý xóa...');
      try {
        await http.delete(`/ho-so-bieu-mau/${maHoSo}`);
        toast.success('Xóa thành công!', { id: toastId });
        fetchForms();
      } catch (error) { 
        toast.error('Xóa thất bại!', { id: toastId });
      }
    }
  };

  const handleEditClick = (form: BieuMau) => {
    setEditingForm(form);
    setFormData({ tenHoSo: form.TenHoSo, noiDung: form.NoiDung || '', file: null });
  };

  // ---------------------------------------------
  // XỬ LÝ THÊM MỚI (CÓ TOAST LOADING)
  // ---------------------------------------------
  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.file) {
        toast.error('Vui lòng chọn file!');
        return;
    }

    const submitData = new FormData();
    submitData.append('tenHoSo', formData.tenHoSo);
    submitData.append('noiDung', formData.noiDung);
    submitData.append('file', formData.file);

    // Bật thông báo đang tải...
    const toastId = toast.loading('Đang tải file lên hệ thống... Vui lòng đợi!');

    try {
      await http.post('/ho-so-bieu-mau', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Thành công -> Đổi thông báo thành tick xanh
      toast.success('Thêm biểu mẫu thành công!', { id: toastId });
      resetForm();
      fetchForms();
    } catch (error) {
      console.error(error);
      // Thất bại -> Đổi thông báo thành X đỏ
      toast.error('Thêm thất bại! Vui lòng thử lại.', { id: toastId });
    }
  };

  // ---------------------------------------------
  // XỬ LÝ CẬP NHẬT (CÓ TOAST LOADING)
  // ---------------------------------------------
  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingForm) return;

    const submitData = new FormData();
    submitData.append('tenHoSo', formData.tenHoSo);
    submitData.append('noiDung', formData.noiDung);
    
    if (formData.file) {
      submitData.append('file', formData.file);
    }

    // Bật thông báo đang tải...
    const loadingMessage = formData.file ? 'Đang cập nhật và tải file mới lên...' : 'Đang cập nhật dữ liệu...';
    const toastId = toast.loading(loadingMessage);

    try {
      await http.put(`/ho-so-bieu-mau/${editingForm.MaHoSo}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Cập nhật thành công!', { id: toastId });
      resetForm();
      fetchForms();
    } catch (error) {
      console.error(error);
      toast.error('Cập nhật thất bại!', { id: toastId });
    }
  };

  const resetForm = () => {
    setFormData({ tenHoSo: '', noiDung: '', file: null });
    setIsCreating(false);
    setEditingForm(null);
  };

  const styles = {
    container: { backgroundColor: '#13141f', minHeight: '100vh', padding: '20px', color: '#fff' },
    card: { backgroundColor: '#1e1f2f', borderColor: '#2d2e42', color: '#fff' },
    tableHeader: { color: '#f8cc46', borderBottom: '1px solid #2d2e42', backgroundColor: 'transparent' },
    tableCell: { color: '#c4c4d4', borderBottom: '1px solid #2d2e42', verticalAlign: 'middle', backgroundColor: 'transparent' },
    btnYellow: { backgroundColor: '#f8cc46', color: '#000', fontWeight: 'bold', border: 'none' },
    inputDark: { backgroundColor: '#13141f', color: '#fff', border: '1px solid #2d2e42' }
  };

  return (
    <div className="main-wrapper" style={styles.container}>
      {/* Component Toaster cấu hình vị trí ở góc trên bên phải */}
      <Toaster position="top-right" reverseOrder={false} />

      <main className="main-content" style={{ width: '100%' }}>
        <div className="content-wrapper">
          
          {/* Màn hình Danh sách */}
          {!isCreating && !viewingForm && !editingForm && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: '#f8cc46' }}>Danh sách Biểu mẫu</h2>
                <button 
                  className="btn px-4 py-2" 
                  style={styles.btnYellow} 
                  onClick={() => setIsCreating(true)}
                >
                  + Thêm Biểu mẫu
                </button>
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
                                  <button className="btn btn-sm btn-success" onClick={() => handleDownload(form.DuongDan)}>Tải</button>
                                  <button className="btn btn-sm btn-warning text-dark" onClick={() => handleEditClick(form)}>Sửa</button>
                                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(form.MaHoSo)}>Xóa</button>
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
                    <div className="col-md-3 fw-bold text-muted">Đường dẫn:</div>
                    <div className="col-md-9">
                      <a href={viewingForm.DuongDan} target="_blank" rel="noreferrer" style={{ color: '#4da3ff' }}>
                        {viewingForm.DuongDan}
                      </a>
                    </div>
                  </div>
                  <button className="btn btn-secondary" onClick={() => setViewingForm(null)}>Quay Lại</button>
                </div>
              </div>
            </>
          )}

          {/* Màn hình Thêm / Sửa */}
          {(isCreating || editingForm) && (
            <div className="card p-4" style={styles.card}>
              <h4 className="mb-4" style={{ color: '#f8cc46' }}>
                {isCreating ? 'Thêm Biểu Mẫu Mới' : 'Cập Nhật Biểu Mẫu'}
              </h4>
              <form onSubmit={isCreating ? handleCreateSubmit : handleUpdateSubmit}>
                <div className="mb-3">
                  <label className="form-label text-light">Tên hồ sơ</label>
                  <input 
                    className="form-control" 
                    style={styles.inputDark}
                    value={formData.tenHoSo} 
                    onChange={e => setFormData({...formData, tenHoSo: e.target.value})} 
                    required 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-light">Nội dung / Mô tả</label>
                  <textarea 
                    className="form-control" 
                    rows={4} 
                    style={styles.inputDark}
                    value={formData.noiDung} 
                    onChange={e => setFormData({...formData, noiDung: e.target.value})} 
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label text-light">
                    {isCreating ? 'Chọn tệp tin' : 'Chọn tệp tin mới (Để trống nếu giữ nguyên file cũ)'}
                  </label>
                  <input 
                    type="file" 
                    className="form-control" 
                    style={styles.inputDark}
                    onChange={e => e.target.files && setFormData({...formData, file: e.target.files[0]})} 
                    required={isCreating} 
                  />
                </div>
                <button type="submit" className="btn px-4" style={styles.btnYellow}>
                  Lưu
                </button>
                <button type="button" className="btn btn-secondary ms-2 px-4" onClick={resetForm}>
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