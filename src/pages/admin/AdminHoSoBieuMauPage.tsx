import React, { useState, useEffect, useRef } from 'react';
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
    const response = await http.get(`/ho-so-bieu-mau/download/${maHoSo}`, { responseType: 'blob' });
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
    toast.error('Không thể tải file, vui lòng thử lại!', { id: toastId });
  }
};

const handlePreview = (duongDan: string | undefined) => {
  if (!duongDan) return toast.error('Đường dẫn bị trống!');
  const fileUrl = duongDan.startsWith('http') ? duongDan : `http://localhost:4000/${duongDan.startsWith('/') ? duongDan.slice(1) : duongDan}`;
  window.open(fileUrl, '_blank');
};

export function AdminHoSoBieuMauPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [viewingForm, setViewingForm] = useState<BieuMau | null>(null);
  const [editingForm, setEditingForm] = useState<BieuMau | null>(null);
  const [forms, setForms] = useState<BieuMau[]>([]);
  
  // State quản lý Form bao gồm cả file preview
  const [formData, setFormData] = useState({ 
    tenHoSo: '', 
    noiDung: '', 
    file: null as File | null,
    existingDuongDan: null as string | null // Lưu URL file cũ khi Edit
  });
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchForms(); }, []);

  const fetchForms = async () => {
    try {
      const response = await http.get('/ho-so-bieu-mau');
      setForms(response.data);
    } catch (error) {
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
    setFormData({ 
      tenHoSo: form.TenHoSo, 
      noiDung: form.NoiDung || '', 
      file: null,
      existingDuongDan: form.DuongDan || null
    });
    setPreviewUrl(null);
  };

  // --- LOGIC XỬ LÝ CHỌN FILE VÀ PREVIEW ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFormData({ ...formData, file: selectedFile, existingDuongDan: null }); // Xóa link cũ nếu chọn file mới
      
      // Tạo URL ảo để xem trước ảnh/file
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, file: null, existingDuongDan: null });
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.file) return toast.error('Vui lòng chọn file!');

    const submitData = new FormData();
    submitData.append('tenHoSo', formData.tenHoSo);
    submitData.append('noiDung', formData.noiDung);
    submitData.append('file', formData.file);

    const toastId = toast.loading('Đang tải file lên hệ thống...');
    try {
      await http.post('/ho-so-bieu-mau', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Thêm biểu mẫu thành công!', { id: toastId });
      resetForm();
      fetchForms();
    } catch (error) {
      toast.error('Thêm thất bại!', { id: toastId });
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingForm) return;

    const submitData = new FormData();
    submitData.append('tenHoSo', formData.tenHoSo);
    submitData.append('noiDung', formData.noiDung);
    if (formData.file) submitData.append('file', formData.file);

    const toastId = toast.loading(formData.file ? 'Đang cập nhật và tải file mới...' : 'Đang cập nhật...');
    try {
      await http.put(`/ho-so-bieu-mau/${editingForm.MaHoSo}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Cập nhật thành công!', { id: toastId });
      resetForm();
      fetchForms();
    } catch (error) {
      toast.error('Cập nhật thất bại!', { id: toastId });
    }
  };

  const resetForm = () => {
    setFormData({ tenHoSo: '', noiDung: '', file: null, existingDuongDan: null });
    setPreviewUrl(null);
    setIsCreating(false);
    setEditingForm(null);
  };

  // --- HÀM RENDER COMPONENT PREVIEW ---
  const renderFilePreview = () => {
    const fileSource = previewUrl || formData.existingDuongDan;
    if (!fileSource) return null;

    // Kiểm tra xem là ảnh hay document
    const isImage = formData.file 
      ? formData.file.type.startsWith('image/')
      : formData.existingDuongDan?.match(/\.(jpeg|jpg|gif|png)$/i);

    return (
      <div className="position-relative mt-3 p-2 rounded" style={{ backgroundColor: '#13141f', border: '1px solid #2d2e42', width: 'fit-content' }}>
        <button 
          type="button"
          onClick={removeFile}
          className="btn btn-sm btn-danger position-absolute" 
          style={{ top: '-10px', right: '-10px', borderRadius: '50%', width: '28px', height: '28px', padding: 0, zIndex: 10 }}
        >
          ✕
        </button>
        {isImage ? (
          <img src={fileSource} alt="preview" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ width: '150px', height: '150px', color: '#c4c4d4' }}>
            <span style={{ fontSize: '40px' }}>📄</span>
            <span className="text-center mt-2" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
              {formData.file ? formData.file.name : formData.existingDuongDan?.split('/').pop()}
            </span>
          </div>
        )}
      </div>
    );
  };

  const styles = {
    container: { padding: '20px', color: '#fff', width: '100%' },
    card: { backgroundColor: '#1e1f2f', borderColor: '#2d2e42', color: '#fff' },
    tableHeader: { color: '#f8cc46', borderBottom: '1px solid #2d2e42', backgroundColor: 'transparent' },
    tableCell: { color: '#c4c4d4', borderBottom: '1px solid #2d2e42', verticalAlign: 'middle', backgroundColor: 'transparent' },
    btnYellow: { backgroundColor: '#f8cc46', color: '#000', fontWeight: 'bold', border: 'none' },
    inputDark: { backgroundColor: '#13141f', color: '#fff', border: '1px solid #2d2e42' }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" reverseOrder={false} />

      {/* MÀN HÌNH DANH SÁCH */}
      {!isCreating && !viewingForm && !editingForm && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ color: '#f8cc46' }}>Danh sách Biểu mẫu</h2>
            <button className="btn px-4 py-2" style={styles.btnYellow} onClick={() => setIsCreating(true)}>
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
                      <tr><td colSpan={3} className="text-center py-4" style={{ color: '#f8cc46' }}>Không có dữ liệu</td></tr>
                    ) : (
                      forms.map((form, index) => (
                        <tr key={form.MaHoSo}>
                          <td style={styles.tableCell}>{index + 1}</td>
                          <td style={styles.tableCell}>{form.TenHoSo}</td>
                          <td style={styles.tableCell}>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-info text-white" onClick={() => setViewingForm(form)}>Xem</button>
                              <button className="btn btn-sm btn-success" onClick={() => handleDownload(form.MaHoSo, form.TenHoSo)}>Tải</button>
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

      {/* MÀN HÌNH THÊM / SỬA */}
      {(isCreating || editingForm) && (
        <div className="card p-4" style={styles.card}>
          <h4 className="mb-4" style={{ color: '#f8cc46' }}>
            {isCreating ? 'Thêm Biểu Mẫu Mới' : 'Cập Nhật Biểu Mẫu'}
          </h4>
          <form onSubmit={isCreating ? handleCreateSubmit : handleUpdateSubmit}>
            <div className="mb-3">
              <label className="form-label text-light">Tên hồ sơ</label>
              <input className="form-control" style={styles.inputDark} value={formData.tenHoSo} onChange={e => setFormData({...formData, tenHoSo: e.target.value})} required />
            </div>
            <div className="mb-3">
              <label className="form-label text-light">Nội dung / Mô tả</label>
              <textarea className="form-control" rows={4} style={styles.inputDark} value={formData.noiDung} onChange={e => setFormData({...formData, noiDung: e.target.value})} />
            </div>
            
            <div className="mb-4">
              <label className="form-label text-light">
                Tệp tin đính kèm
              </label>
              
              {(!formData.file && !formData.existingDuongDan) && (
                 <input 
                   type="file" 
                   ref={fileInputRef}
                   className="form-control" 
                   style={styles.inputDark} 
                   onChange={handleFileChange} 
                   required={isCreating} 
                 />
              )}

              {renderFilePreview()}
            </div>

            <div className="mt-4">
              <button type="submit" className="btn px-4" style={styles.btnYellow}>Lưu</button>
              <button type="button" className="btn btn-secondary ms-2 px-4" onClick={resetForm}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* MÀN HÌNH XEM CHI TIẾT (CÁCH 1) */}
      {viewingForm && (
        <div className="card p-4" style={styles.card}>
          <h4 className="mb-4" style={{ color: '#f8cc46' }}>
            Chi Tiết Biểu Mẫu
          </h4>
          
          <div className="mb-3">
            <label className="form-label text-light fw-bold" style={{ color: '#8b8c9e' }}>Tên hồ sơ:</label>
            <p className="text-white fs-5">{viewingForm.TenHoSo}</p>
          </div>
          
          <div className="mb-3">
            <label className="form-label text-light fw-bold" style={{ color: '#8b8c9e' }}>Nội dung / Mô tả:</label>
            <div 
              className="text-white p-3 rounded" 
              style={{ 
                backgroundColor: '#13141f', 
                border: '1px solid #2d2e42', 
                whiteSpace: 'pre-wrap',
                minHeight: '100px'
              }}
            >
              {viewingForm.NoiDung || <span style={{ color: '#8b8c9e', fontStyle: 'italic' }}>Không có mô tả</span>}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="form-label text-light fw-bold" style={{ color: '#8b8c9e' }}>Tệp tin đính kèm:</label>
            <div className="mt-2">
              {viewingForm.DuongDan ? (
                <button 
                  className="btn btn-info text-white d-flex align-items-center gap-2"
                  onClick={() => handlePreview(viewingForm.DuongDan)}
                >
                  <span style={{ fontSize: '18px' }}>📄</span> Tải file đính kèm
                </button>
              ) : (
                <span style={{ color: '#c4c4d4', fontStyle: 'italic' }}>Không có file đính kèm</span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3" style={{ borderTop: '1px solid #2d2e42' }}>
            <button 
              type="button" 
              className="btn btn-secondary px-4" 
              onClick={() => setViewingForm(null)}
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      )}

    </div>
  );
}