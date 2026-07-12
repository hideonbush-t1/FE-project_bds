import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Row, Col, ConfigProvider, theme } from 'antd';
import { http } from '../../api/http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; // Dùng chung CSS của Bất động sản

export function AdminThongBaoPage() {
  const [thongBaoList, setThongBaoList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  
  // State Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // State Modal Form (Thêm/Sửa)
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // State Modal Xóa đồng bộ
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const GOLD_COLOR = '#D4AF37'; 

  // Tải dữ liệu thay cho useFetch cũ để dễ đồng bộ UI
  const fetchData = async () => {
    try {
      const response = await http.get('/thong-bao');
      
      // Sắp xếp Mới nhất lên đầu (Dựa vào ID hoặc ngày đăng)
      let list = response.data || [];
      list.sort((a: any, b: any) => b.id - a.id);
      
      setThongBaoList(list);
    } catch (error) {
      toast.error('Không thể tải danh sách thông báo!');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hành động Mở Form
  const handleOpenAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsFormVisible(true);
  };

  const handleOpenEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue({
      tieuDe: record.tieuDe,
      noiDung: record.noiDung
    });
    setIsFormVisible(true);
  };

  // Hành động Lưu Form
  const handleFinishForm = async (values: any) => {
    try {
      if (editingId) {
        await http.patch(`/thong-bao/${editingId}`, values);
        toast.success('Cập nhật thông báo thành công!');
      } else {
        await http.post('/thong-bao', values);
        toast.success('Tạo thông báo thành công!');
      }
      setIsFormVisible(false);
      fetchData();
    } catch (error: any) {
      toast.error('Có lỗi xảy ra: ' + (error.response?.data?.message || 'Lỗi hệ thống'));
    }
  };

  // Hành động Xóa
  const handleDeleteClick = (id: number) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      await http.delete(`/thong-bao/${idToDelete}`);
      toast.success('Đã xóa thông báo thành công!');
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi xóa thông báo!');
    } finally {
      setShowDeleteModal(false);
      setIdToDelete(null);
    }
  };

  // Lọc và Phân trang Bảng
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
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: GOLD_COLOR, colorBgBase: '#1a1a2e', colorBgContainer: '#16213e', colorTextBase: '#ffffff' } }}>
      <div className="bds-container">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        
        {/* HEADER ĐỒNG BỘ */}
        <div className="bds-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h2>Danh sách Thông báo</h2>
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
            <button className="btn-add" onClick={handleOpenAdd}>
              + Tạo Thông báo
            </button>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU ĐỒNG BỘ */}
        <div className="bds-table-wrapper">
          <table className="bds-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th style={{ width: '25%' }}>Tiêu đề</th>
                <th>Nội dung</th>
                <th style={{ width: '150px' }}>Ngày đăng</th>
                <th className="actions" style={{ width: '150px' }}>Thao tác</th>
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
                    <td className="actions">
                      <button className="btn-edit" onClick={() => handleOpenEdit(row)}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDeleteClick(row.id)}>Xóa</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
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

        {/* POPUP XÓA ĐỒNG BỘ (HTML/CSS thuần) */}
        {showDeleteModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ backgroundColor: '#1a1a2e', padding: '30px', borderRadius: '12px', border: '1px solid #e74c3c', width: '400px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
              <h3 style={{ color: '#e74c3c', marginTop: 0, marginBottom: '15px' }}>⚠️ Xác nhận xóa</h3>
              <p style={{ color: '#ecf0f1', marginBottom: '25px', lineHeight: '1.5' }}>
                Bạn có chắc chắn muốn xóa thông báo <strong>#{idToDelete}</strong> không?<br/> Hành động này không thể hoàn tác!
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
          title={<div style={{ color: GOLD_COLOR, fontSize: '18px', paddingBottom: '10px' }}>{editingId ? 'CẬP NHẬT THÔNG BÁO' : 'TẠO THÔNG BÁO MỚI'}</div>} 
          open={isFormVisible} 
          onCancel={() => setIsFormVisible(false)} 
          footer={null} 
          width={650}
        >
          <Form form={form} layout="vertical" onFinish={handleFinishForm}>
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Form.Item name="tieuDe" label="Tiêu đề thông báo" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
                  <Input placeholder="Nhập tiêu đề..." size="large" />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item name="noiDung" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
                  <Input.TextArea rows={6} placeholder="Nhập nội dung chi tiết..." size="large" />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #333' }}>
              <button type="button" onClick={() => setIsFormVisible(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Hủy bỏ</button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: GOLD_COLOR, color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>Lưu thông báo</button>
            </div>
          </Form>
        </Modal>

      </div>
    </ConfigProvider>
  );
}