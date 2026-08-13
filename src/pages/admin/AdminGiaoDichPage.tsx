import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Select, DatePicker, Row, Col, ConfigProvider, theme, Input } from 'antd';
import { UserOutlined, HomeOutlined, DollarOutlined } from '@ant-design/icons';
import { http } from '../../api/http';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; // Dùng chung CSS của Bất động sản

const { Option } = Select;

export function AdminGiaoDichPage() {
  const location = useLocation(); 
  const navigate = useNavigate();

  const [giaoDichList, setGiaoDichList] = useState<any[]>([]);
  const [khachHangList, setKhachHangList] = useState<any[]>([]); 
  const [searchText, setSearchText] = useState('');
  
  // State Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // State Modal Form (Thêm/Sửa)
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [associatedNhuCauId, setAssociatedNhuCauId] = useState<string | null>(null);
  const [pendingInitData, setPendingInitData] = useState<any>(null);

  // State Modal Chi tiết
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  // State Modal Xóa đồng bộ
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);

  const GOLD_COLOR = '#D4AF37'; 

  useEffect(() => {
    if (location.state && location.state.khachHangId) {
      setPendingInitData(location.state);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const fetchData = async () => {
    try {
      const [resGD, resKH] = await Promise.all([http.get('/giao-dich'), http.get('/khach-hang')]);
      setGiaoDichList(resGD.data); 
      setKhachHangList(resKH.data);
    } catch (error) { 
      toast.error('Lỗi tải dữ liệu!'); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (pendingInitData && khachHangList.length > 0) {
      setEditingId(null); 
      form.resetFields();
      form.setFieldsValue({
        benMuaId: pendingInitData.khachHangId, benBanId: pendingInitData.benBanId || null,
        batDongSanId: pendingInitData.batDongSanId, soTien: pendingInitData.soTien || undefined,
        tinhTrang: 'Đang xử lý'
      });
      if (pendingInitData.nhuCauId) setAssociatedNhuCauId(pendingInitData.nhuCauId);
      setIsFormVisible(true); 
      setPendingInitData(null);
    }
  }, [pendingInitData, khachHangList, form]);

  const getKhachHangName = (id: string) => { 
    const kh = khachHangList.find(k => k.id === id); 
    return kh ? `${kh.hoTen} (${id})` : id; 
  };
  
  const khachHangOptions = useMemo(() => 
    khachHangList.map(kh => ({ value: kh.id, label: `${kh.hoTen} (${kh.id})` })), 
  [khachHangList]);

  // Hành động Form
  const handleOpenAdd = () => { 
    setEditingId(null); 
    setAssociatedNhuCauId(null); 
    form.resetFields(); 
    setIsFormVisible(true); 
  };

  const handleOpenEdit = (record: any) => {
    setEditingId(record.id); 
    setAssociatedNhuCauId(null);
    form.setFieldsValue({
      nhanVienId: record.nhanVienId, batDongSanId: record.batDongSanId,
      benMuaId: record.benMua, benBanId: record.benBan, soTien: record.soTien,
      tyLeHoaHong: record.tyLeHoaHong, ngayGD: dayjs(record.ngayGD),
      tinhTrang: record.tinhTrang, moTaGD: record.moTaGD
    });
    setIsFormVisible(true);
  };

  const handleFinishForm = async (values: any) => {
    try {
      const payload: any = {
        nhanVienId: values.nhanVienId, batDongSanId: values.batDongSanId,
        benMuaId: values.benMuaId, benBanId: values.benBanId || null,
        soTien: String(values.soTien), tyLeHoaHong: values.tyLeHoaHong ? Number(values.tyLeHoaHong) : 0,
        ngayGD: values.ngayGD ? values.ngayGD.toISOString() : new Date().toISOString(),
        tinhTrang: values.tinhTrang, moTaGD: values.moTaGD || null,
      };

      if (editingId) { 
        await http.patch(`/giao-dich/${editingId}`, payload); 
        toast.success('Đã cập nhật giao dịch!'); 
      } else { 
        await http.post('/giao-dich', payload); 
        toast.success('Đã tạo mới giao dịch!'); 
      }

      // Logic đồng bộ BĐS
      try {
        if (values.tinhTrang === 'Đã hủy') {
          await http.patch(`/bat-dong-san/${values.batDongSanId}`, { tinhTrang: 'Trống' });
        } else if (values.tinhTrang === 'Thành công') {
          await http.patch(`/bat-dong-san/${values.batDongSanId}`, { tinhTrang: 'Đã bán' });
          if (associatedNhuCauId) await http.patch(`/nhu-cau/${associatedNhuCauId}`, { tinhTrang: 'Đã hoàn thành' });
        } else {
          await http.patch(`/bat-dong-san/${values.batDongSanId}`, { tinhTrang: 'Đang giao dịch' });
        }
      } catch (e) {
        console.error("Lỗi đồng bộ tự động:", e);
      }

      setIsFormVisible(false); 
      fetchData();
    } catch (error) { toast.error('Lỗi lưu dữ liệu!'); }
  };

  // Hành động Xóa
  const handleDeleteClick = (record: any) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try { 
      await http.patch(`/bat-dong-san/${recordToDelete.batDongSanId}`, { tinhTrang: 'Trống' });
      await http.delete(`/giao-dich/${recordToDelete.id}`); 
      toast.success('Đã xóa giao dịch và hoàn lại BĐS vào kho!'); 
      fetchData(); 
    } catch (error) { 
      toast.error('Lỗi khi xóa!'); 
    } finally {
      setShowDeleteModal(false);
      setRecordToDelete(null);
    }
  };

  // Lọc và Phân trang Bảng chính
  const filteredList = giaoDichList.filter((gd) => {
    if (!searchText) return true;
    const lowerSearch = searchText.toLowerCase();
    return (
      (gd.id && gd.id.toLowerCase().includes(lowerSearch)) ||
      (gd.batDongSanId && gd.batDongSanId.toLowerCase().includes(lowerSearch)) ||
      (getKhachHangName(gd.benMua).toLowerCase().includes(lowerSearch))
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
          <h2>Danh sách Giao dịch</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Tìm Mã GD, Mã BĐS, Tên KH..."
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
              + Thêm Giao dịch
            </button>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU ĐỒNG BỘ */}
        <div className="bds-table-wrapper">
          <table className="bds-table">
            <thead>
              <tr>
                <th>Mã GD</th>
                <th>Bên Mua</th>
                <th>Bên Bán</th>
                <th>Mã BĐS</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th className="actions">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((gd: any) => (
                  <tr key={gd.id}>
                    <td style={{ fontWeight: 'bold' }}>{gd.id}</td>
                    <td>{getKhachHangName(gd.benMua)}</td>
                    <td>{gd.benBan ? getKhachHangName(gd.benBan) : '—'}</td>
                    <td style={{ color: GOLD_COLOR, fontWeight: 'bold' }}>{gd.batDongSanId}</td>
                    <td style={{ fontWeight: 'bold', color: '#fff' }}>{Number(gd.soTien).toLocaleString('vi-VN')} đ</td>
                    <td>
                      <span className={`status ${gd.tinhTrang === 'Thành công' ? 'sold' : gd.tinhTrang === 'Đã hủy' ? 'sold' : 'available'}`}
                            style={{ 
                              backgroundColor: gd.tinhTrang === 'Thành công' ? 'rgba(46, 204, 113, 0.2)' : gd.tinhTrang === 'Đã hủy' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                              color: gd.tinhTrang === 'Thành công' ? '#2ecc71' : gd.tinhTrang === 'Đã hủy' ? '#e74c3c' : '#f1c40f', 
                              border: 'none' 
                            }}>
                        {gd.tinhTrang || 'Đang xử lý'}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn-view" onClick={() => { setDetailData(gd); setIsDetailVisible(true); }}>Xem</button>
                      <button className="btn-edit" onClick={() => handleOpenEdit(gd)}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDeleteClick(gd)}>Xóa</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                    {searchText ? 'Không tìm thấy giao dịch nào phù hợp' : 'Không có dữ liệu'}
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
                Bạn có chắc chắn muốn xóa giao dịch <strong>{recordToDelete?.id}</strong> không?<br/> 
                Hành động này sẽ hoàn lại trạng thái BĐS vào kho và không thể hoàn tác!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button onClick={() => { setShowDeleteModal(false); setRecordToDelete(null); }} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#95a5a6', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Hủy bỏ</button>
                <button onClick={confirmDelete} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#e74c3c', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Đồng ý xóa</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FORM THÊM/SỬA (Giữ nguyên Ant Design Dark Mode) */}
        <Modal title={<div style={{ color: GOLD_COLOR, fontSize: '18px', paddingBottom: '10px' }}>{editingId ? 'CẬP NHẬT GIAO DỊCH' : 'TẠO GIAO DỊCH MỚI'}</div>} open={isFormVisible} onCancel={() => setIsFormVisible(false)} footer={null} width={800}>
          <Form form={form} layout="vertical" onFinish={handleFinishForm}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}><Form.Item name="nhanVienId" label="Mã Nhân viên tạo" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="batDongSanId" label="Mã Bất động sản" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="benMuaId" label="Bên Mua (Khách hàng)" rules={[{ required: true }]}><Select showSearch placeholder="Tìm tên..." options={khachHangOptions} optionFilterProp="label" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="benBanId" label="Bên Bán (Chủ nhà)"><Select showSearch allowClear placeholder="Tìm tên..." options={khachHangOptions} optionFilterProp="label" /></Form.Item></Col>
              
              <Col xs={24} md={8}>
                <Form.Item name="soTien" label="Số tiền chốt (VNĐ)" rules={[
                  { required: true, message: 'Nhập số tiền!' },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      const num = Number(value);
                      if (num > 100000000000) return Promise.reject(new Error('Tối đa 100 Tỷ!'));
                      if (num < 1000000) return Promise.reject(new Error('Tối thiểu 1 Triệu!'));
                      return Promise.resolve();
                    }
                  })
                ]}><Input type="number" suffix={<span style={{ color: GOLD_COLOR }}>VNĐ</span>} /></Form.Item>
              </Col>
              <Col xs={24} md={8}><Form.Item name="tyLeHoaHong" label="Hoa hồng (%)"><Input type="number" step="0.1" /></Form.Item></Col>
              <Col xs={24} md={8}><Form.Item name="ngayGD" label="Ngày Giao dịch" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={24}><Form.Item name="tinhTrang" label="Trạng thái" rules={[{ required: true }]}><Select options={[{ label: 'Đang xử lý', value: 'Đang xử lý' }, { label: 'Thành công', value: 'Thành công' }, { label: 'Đã hủy', value: 'Đã hủy' }]} /></Form.Item></Col>
              <Col span={24}><Form.Item name="moTaGD" label="Ghi chú"><Input.TextArea rows={4} /></Form.Item></Col>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #333' }}>
              <button type="button" onClick={() => setIsFormVisible(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Hủy bỏ</button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: GOLD_COLOR, color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>Lưu thông tin</button>
            </div>
          </Form>
        </Modal>

        {/* MODAL CHI TIẾT (Giữ nguyên UI Đẹp cũ) */}
        <Modal title={<div style={{ color: GOLD_COLOR, textAlign: 'center', fontSize: '22px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>HỒ SƠ GIAO DỊCH</div>} open={isDetailVisible} onCancel={() => setIsDetailVisible(false)} footer={null} width={800}>
          {detailData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              <div style={{ backgroundColor: '#1a1a2e', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `5px solid ${GOLD_COLOR}` }}>
                <div><div style={{ color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>MÃ GIAO DỊCH</div><div style={{ color: GOLD_COLOR, fontSize: '20px', fontWeight: 'bold' }}>{detailData.id}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>TRẠNG THÁI</div>
                  <span style={{ 
                    backgroundColor: detailData.tinhTrang === 'Thành công' ? 'rgba(46, 204, 113, 0.2)' : detailData.tinhTrang === 'Đã hủy' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(241, 196, 15, 0.2)', 
                    color: detailData.tinhTrang === 'Thành công' ? '#2ecc71' : detailData.tinhTrang === 'Đã hủy' ? '#e74c3c' : '#f1c40f', 
                    padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' 
                  }}>
                    {detailData.tinhTrang || 'Đang xử lý'}
                  </span>
                </div>
              </div>
              <div style={{ backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 style={{ color: GOLD_COLOR, fontSize: '17px', marginTop: 0, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px dashed #444' }}><UserOutlined className="mr-2" /> THÔNG TIN CÁC BÊN</h3>
                <Row gutter={[32, 24]}>
                  <Col xs={24} md={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Bên Mua (Khách hàng)</div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{getKhachHangName(detailData.benMua)}</div></Col>
                  <Col xs={24} md={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Bên Bán (Chủ nhà)</div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{detailData.benBan ? getKhachHangName(detailData.benBan) : 'Không có'}</div></Col>
                  <Col span={24}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Nhân viên chốt đơn</div><div style={{ color: '#fff', fontSize: '16px' }}>{detailData.nhanVienId}</div></Col>
                </Row>
              </div>
              <div style={{ backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 style={{ color: '#52c41a', fontSize: '17px', marginTop: 0, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px dashed #444' }}><DollarOutlined className="mr-2" /> BẤT ĐỘNG SẢN & TÀI CHÍNH</h3>
                <Row gutter={[32, 24]}>
                  <Col xs={24} md={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Mã Bất Động Sản</div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}><HomeOutlined /> {detailData.batDongSanId}</div></Col>
                  <Col xs={24} md={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Ngày Giao Dịch</div><div style={{ color: '#fff', fontSize: '16px' }}>{dayjs(detailData.ngayGD).format('DD/MM/YYYY')}</div></Col>
                  <Col xs={24} md={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Số Tiền Thỏa Thuận</div><div style={{ color: GOLD_COLOR, fontSize: '22px', fontWeight: 'bold' }}>{Number(detailData.soTien).toLocaleString('vi-VN')} VNĐ</div></Col>
                  <Col xs={24} md={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Tỷ lệ Hoa hồng</div><div style={{ color: '#fff', fontSize: '16px' }}>{detailData.tyLeHoaHong}%</div></Col>
                  {detailData.moTaGD && <Col span={24}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Ghi chú</div><div style={{ color: '#ddd', fontStyle: 'italic', lineHeight: '1.6' }}>{detailData.moTaGD}</div></Col>}
                </Row>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
}