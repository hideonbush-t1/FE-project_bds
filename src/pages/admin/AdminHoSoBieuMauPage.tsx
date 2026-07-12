import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Row, Col, ConfigProvider, theme } from 'antd';
import { FileOutlined, FileTextOutlined } from '@ant-design/icons';
import { http } from '../../api/http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; // Dùng chung CSS của Bất động sản

interface BieuMau {
  MaHoSo: number;
  TenHoSo: string;
  NoiDung: string;
  DuongDan: string;
}

export function AdminHoSoBieuMauPage() {
  const [forms, setForms] = useState<BieuMau[]>([]);
  const [searchText, setSearchText] = useState('');
  
  // State Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // State Modal Form (Thêm/Sửa)
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingForm, setEditingForm] = useState<BieuMau | null>(null);
  const [form] = Form.useForm();
  
  // State quản lý File
  const [fileData, setFileData] = useState<{ file: File | null; existingDuongDan: string | null }>({ 
    file: null, 
    existingDuongDan: null 
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Modal Xem chi tiết
  const [viewingForm, setViewingForm] = useState<BieuMau | null>(null);

  // State Modal Xóa đồng bộ
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const GOLD_COLOR = '#D4AF37'; 

  useEffect(() => { 
    fetchForms(); 
  }, []);

  const fetchForms = async () => {
    try {
      const response = await http.get('/ho-so-bieu-mau');
      // Sắp xếp ID giảm dần (mới nhất lên đầu)
      const list = response.data || [];
      list.sort((a: BieuMau, b: BieuMau) => b.MaHoSo - a.MaHoSo);
      setForms(list);
    } catch (error) {
      toast.error('Không thể tải danh sách biểu mẫu!');
    }
  };

  // --- LOGIC XỬ LÝ FILE (Upload / Preview / Download) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileData({ file: selectedFile, existingDuongDan: null });
      
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const removeFile = () => {
    setFileData({ file: null, existingDuongDan: null });
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const handleDownload = async (maHoSo: number, tenHoSo: string) => {
    const toastId = toast.loading('Đang tải file từ máy chủ...');
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
      toast.update(toastId, { render: 'Tải file thành công!', type: 'success', isLoading: false, autoClose: 3000 });
    } catch (error) {
      toast.update(toastId, { render: 'Không thể tải file!', type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  const handlePreview = (duongDan: string | undefined) => {
    if (!duongDan) return toast.error('Đường dẫn bị trống!');
    const fileUrl = duongDan.startsWith('http') ? duongDan : `http://localhost:4000/${duongDan.startsWith('/') ? duongDan.slice(1) : duongDan}`;
    window.open(fileUrl, '_blank');
  };

  // --- HÀNH ĐỘNG FORM ---
  const handleOpenAdd = () => {
    setEditingForm(null);
    form.resetFields();
    removeFile();
    setIsFormVisible(true);
  };

  const handleOpenEdit = (record: BieuMau) => {
    setEditingForm(record);
    form.setFieldsValue({
      tenHoSo: record.TenHoSo,
      noiDung: record.NoiDung
    });
    setFileData({ file: null, existingDuongDan: record.DuongDan || null });
    setPreviewUrl(null);
    setIsFormVisible(true);
  };

  const handleFinishForm = async (values: any) => {
    if (!editingForm && !fileData.file) return toast.error('Vui lòng chọn tệp đính kèm!');

    const submitData = new FormData();
    submitData.append('tenHoSo', values.tenHoSo);
    submitData.append('noiDung', values.noiDung || '');
    if (fileData.file) submitData.append('file', fileData.file);

    const toastId = toast.loading(fileData.file ? 'Đang tải file lên hệ thống...' : 'Đang xử lý...');
    try {
      if (editingForm) {
        await http.put(`/ho-so-bieu-mau/${editingForm.MaHoSo}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.update(toastId, { render: 'Cập nhật biểu mẫu thành công!', type: 'success', isLoading: false, autoClose: 3000 });
      } else {
        await http.post('/ho-so-bieu-mau', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.update(toastId, { render: 'Thêm biểu mẫu thành công!', type: 'success', isLoading: false, autoClose: 3000 });
      }
      setIsFormVisible(false);
      fetchForms();
    } catch (error) {
      toast.update(toastId, { render: 'Xử lý thất bại, vui lòng thử lại!', type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  // --- HÀNH ĐỘNG XÓA ---
  const handleDeleteClick = (id: number) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    const toastId = toast.loading('Đang xử lý xóa...');
    try {
      await http.delete(`/ho-so-bieu-mau/${idToDelete}`);
      toast.update(toastId, { render: 'Đã xóa biểu mẫu!', type: 'success', isLoading: false, autoClose: 3000 });
      fetchForms();
    } catch (error) {
      toast.update(toastId, { render: 'Xóa thất bại!', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setShowDeleteModal(false);
      setIdToDelete(null);
    }
  };

  // --- LỌC & PHÂN TRANG ---
  const filteredList = forms.filter((f) => {
    if (!searchText) return true;
    const lowerSearch = searchText.toLowerCase();
    return (
      (f.TenHoSo && f.TenHoSo.toLowerCase().includes(lowerSearch)) ||
      (f.NoiDung && f.NoiDung.toLowerCase().includes(lowerSearch))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));

  // --- RENDER PREVIEW FILE ---
  const renderFilePreview = () => {
    const fileSource = previewUrl || fileData.existingDuongDan;
    if (!fileSource) return null;

    const isImage = fileData.file 
      ? fileData.file.type.startsWith('image/')
      : fileData.existingDuongDan?.match(/\.(jpeg|jpg|gif|png)$/i);

    return (
      <div style={{ position: 'relative', marginTop: '15px', padding: '10px', backgroundColor: '#13141f', border: '1px solid #2d2e42', width: 'fit-content', borderRadius: '8px' }}>
        <button 
          type="button"
          onClick={removeFile}
          style={{ position: 'absolute', top: '-10px', right: '-10px', borderRadius: '50%', width: '28px', height: '28px', padding: 0, zIndex: 10, backgroundColor: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ✕
        </button>
        {isImage ? (
          <img src={fileSource} alt="preview" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '150px', height: '150px', color: '#c4c4d4' }}>
            <span style={{ fontSize: '40px' }}>📄</span>
            <span style={{ fontSize: '12px', wordBreak: 'break-all', textAlign: 'center', marginTop: '10px' }}>
              {fileData.file ? fileData.file.name : fileData.existingDuongDan?.split('/').pop()}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: GOLD_COLOR, colorBgBase: '#1a1a2e', colorBgContainer: '#16213e', colorTextBase: '#ffffff' } }}>
      <div className="bds-container">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        
        {/* HEADER ĐỒNG BỘ */}
        <div className="bds-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h2>Danh sách Biểu mẫu</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Tìm theo tên hồ sơ..."
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
            <button className="btn-add" onClick={handleOpenAdd}>
              + Thêm Biểu mẫu
            </button>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU ĐỒNG BỘ */}
        <div className="bds-table-wrapper">
          <table className="bds-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th style={{ width: '35%' }}>Tên hồ sơ</th>
                <th>Nội dung / Mô tả</th>
                <th className="actions" style={{ width: '250px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((form) => (
                  <tr key={form.MaHoSo}>
                    <td style={{ fontWeight: 'bold' }}>#{form.MaHoSo}</td>
                    <td style={{ color: GOLD_COLOR, fontWeight: 'bold' }}>{form.TenHoSo}</td>
                    <td style={{ color: '#ccc', lineHeight: '1.5' }}>
                      {form.NoiDung && form.NoiDung.length > 80 ? `${form.NoiDung.substring(0, 80)}...` : (form.NoiDung || '—')}
                    </td>
                    <td className="actions">
                      <button className="btn-view" onClick={() => setViewingForm(form)}>Xem</button>
                      <button 
                        style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#2ecc71', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }} 
                        onClick={() => handleDownload(form.MaHoSo, form.TenHoSo)}
                      >
                        Tải
                      </button>
                      <button className="btn-edit" onClick={() => handleOpenEdit(form)}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDeleteClick(form.MaHoSo)}>Xóa</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                    {searchText ? 'Không tìm thấy biểu mẫu nào phù hợp' : 'Không có dữ liệu biểu mẫu'}
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

        {/* POPUP XÓA ĐỒNG BỘ */}
        {showDeleteModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ backgroundColor: '#1a1a2e', padding: '30px', borderRadius: '12px', border: '1px solid #e74c3c', width: '400px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
              <h3 style={{ color: '#e74c3c', marginTop: 0, marginBottom: '15px' }}>⚠️ Xác nhận xóa</h3>
              <p style={{ color: '#ecf0f1', marginBottom: '25px', lineHeight: '1.5' }}>
                Bạn có chắc chắn muốn xóa biểu mẫu <strong>#{idToDelete}</strong> không?<br/> Hành động này không thể hoàn tác và sẽ xóa tệp đính kèm trên máy chủ!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button onClick={() => { setShowDeleteModal(false); setIdToDelete(null); }} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#95a5a6', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Hủy bỏ</button>
                <button onClick={confirmDelete} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#e74c3c', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Đồng ý xóa</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FORM THÊM/SỬA (Ant Design Dark Mode) */}
        <Modal 
          title={<div style={{ color: GOLD_COLOR, fontSize: '18px', paddingBottom: '10px' }}>{editingForm ? 'CẬP NHẬT BIỂU MẪU' : 'TẠO BIỂU MẪU MỚI'}</div>} 
          open={isFormVisible} 
          onCancel={() => setIsFormVisible(false)} 
          footer={null} 
          width={650}
        >
          <Form form={form} layout="vertical" onFinish={handleFinishForm}>
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Form.Item name="tenHoSo" label="Tên hồ sơ / Biểu mẫu" rules={[{ required: true, message: 'Vui lòng nhập tên hồ sơ!' }]}>
                  <Input placeholder="VD: Mẫu hợp đồng đặt cọc..." size="large" />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item name="noiDung" label="Mô tả nội dung">
                  <Input.TextArea rows={4} placeholder="Nhập ghi chú hoặc mô tả chi tiết..." size="large" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ color: '#fff', fontSize: '14px' }}>
                    <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span> Tệp đính kèm
                  </label>
                </div>
                {(!fileData.file && !fileData.existingDuongDan) && (
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{
                      width: '100%', padding: '8px 12px',
                      backgroundColor: '#16213e', border: '1px solid #4a4e69',
                      borderRadius: '6px', color: '#fff', outline: 'none'
                    }}
                  />
                )}
                {renderFilePreview()}
              </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #333' }}>
              <button type="button" onClick={() => setIsFormVisible(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Hủy bỏ</button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: GOLD_COLOR, color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>Lưu Biểu mẫu</button>
            </div>
          </Form>
        </Modal>

        {/* MODAL CHI TIẾT (UI Đồng bộ BĐS) */}
        <Modal 
          title={<div style={{ color: GOLD_COLOR, textAlign: 'center', fontSize: '22px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>CHI TIẾT HỒ SƠ BIỂU MẪU</div>} 
          open={!!viewingForm} 
          onCancel={() => setViewingForm(null)} 
          footer={null} 
          width={700}
        >
          {viewingForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              
              <div style={{ backgroundColor: '#1a1a2e', padding: '20px', borderRadius: '10px', borderLeft: `5px solid ${GOLD_COLOR}` }}>
                <div style={{ color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>TÊN HỒ SƠ / BIỂU MẪU</div>
                <div style={{ color: GOLD_COLOR, fontSize: '20px', fontWeight: 'bold' }}>{viewingForm.TenHoSo}</div>
              </div>

              <div style={{ backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 style={{ color: '#52c41a', fontSize: '17px', marginTop: 0, marginBottom: '15px', paddingBottom: '12px', borderBottom: '1px dashed #444' }}>
                  <FileTextOutlined className="mr-2" /> NỘI DUNG MÔ TẢ
                </h3>
                <div style={{ color: '#fff', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {viewingForm.NoiDung || <span style={{ color: '#8b8c9e', fontStyle: 'italic' }}>Không có mô tả chi tiết.</span>}
                </div>
              </div>

              <div style={{ backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 style={{ color: '#3498db', fontSize: '17px', marginTop: 0, marginBottom: '15px', paddingBottom: '12px', borderBottom: '1px dashed #444' }}>
                  <FileOutlined className="mr-2" /> TỆP ĐÍNH KÈM
                </h3>
                {viewingForm.DuongDan ? (
                  <button 
                    style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#3498db', color: '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => handlePreview(viewingForm.DuongDan)}
                  >
                    <span style={{ fontSize: '18px' }}>📄</span> Bấm để Mở / Tải tệp đính kèm
                  </button>
                ) : (
                  <span style={{ color: '#e74c3c', fontStyle: 'italic' }}>Hồ sơ này không có tệp đính kèm nào trên máy chủ.</span>
                )}
              </div>
            </div>
          )}
        </Modal>

      </div>
    </ConfigProvider>
  );
}