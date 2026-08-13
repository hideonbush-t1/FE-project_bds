import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Select, Input, Row, Col, Progress, Table as AntTable, ConfigProvider, theme } from 'antd';
import { ThunderboltOutlined, UserOutlined, HomeOutlined, SwapRightOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; // Dùng chung CSS của Bất động sản
import { http } from '../../api/http';

export function AdminNhuCauPage() {
  const navigate = useNavigate();

  const [nhuCauList, setNhuCauList] = useState<any[]>([]);
  const [khachHangList, setKhachHangList] = useState<any[]>([]); 
  const [nhanVienList, setNhanVienList] = useState<any[]>([]); 
  
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // State Modal Form (Thêm/Sửa)
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // State Modal Chi tiết
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  // State Modal Gợi ý
  const [isSuggestModalVisible, setIsSuggestModalVisible] = useState(false);
  const [suggestList, setSuggestList] = useState<any[]>([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [currentNhuCau, setCurrentNhuCau] = useState<any>(null);

  // State Modal Xóa đồng bộ
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const GOLD_COLOR = '#D4AF37'; 

  const fetchData = async () => {
    try {
      const [resNC, resKH, resNV] = await Promise.all([
        http.get('/nhu-cau'), 
        http.get('/khach-hang'), 
        http.get('/nhan-vien')
      ]);
      setNhuCauList(resNC.data); 
      setKhachHangList(resKH.data); 
      setNhanVienList(resNV.data);
    } catch (error) { 
      toast.error('Không thể tải dữ liệu!'); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getKhachHangName = (id: string) => { 
    const kh = khachHangList.find(k => k.id === id); 
    return kh ? `${kh.hoTen} (${id})` : id; 
  };
  
  const getNhanVienName = (id: string) => { 
    const nv = nhanVienList.find(n => n.id === id || n.maNV === id); 
    return nv ? `${nv.hoTen} (${id})` : id; 
  };
  
  const khachHangOptions = useMemo(() => 
    khachHangList.map(kh => ({ value: kh.id, label: `${kh.hoTen} (${kh.id})` })), 
  [khachHangList]);

  // Hành động Form
  const handleOpenAdd = () => { 
    setEditingId(null); 
    form.resetFields(); 
    setIsFormVisible(true); 
  };

  const handleOpenEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue({
      nhanVienId: record.nhanVienId, khachHangId: record.khachHangId,
      loaiNC: record.loaiNC, loaiBDS: record.loaiBDS, viTri: record.viTri,
      dienTichMin: record.dienTichMin, dienTichMax: record.dienTichMax,
      ghiChu: record.ghiChu, tinhTrang: record.tinhTrang
    });
    setIsFormVisible(true);
  };

  const handleFinishForm = async (values: any) => {
    try {
      const payload: any = {
        nhanVienId: values.nhanVienId, khachHangId: values.khachHangId,
        loaiNhuCau: values.loaiNC, loaiBDS: values.loaiBDS, viTri: values.viTri,
        dienTichMin: values.dienTichMin ? Number(values.dienTichMin) : null, 
        dienTichMax: values.dienTichMax ? Number(values.dienTichMax) : null,
        ghiChu: values.ghiChu, 
        tinhTrang: values.tinhTrang || 'Đang tìm kiếm'
      };

      if (editingId) { 
        await http.patch(`/nhu-cau/${editingId}`, payload); 
        toast.success('Đã cập nhật nhu cầu!'); 
      } else { 
        await http.post('/nhu-cau', payload); 
        toast.success('Tạo mới nhu cầu thành công!'); 
      }
      setIsFormVisible(false); 
      fetchData();
    } catch (error) { toast.error('Lỗi khi lưu dữ liệu!'); }
  };

  // Hành động Xóa
  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try { 
      await http.delete(`/nhu-cau/${idToDelete}`); 
      toast.success('Đã xóa nhu cầu!'); 
      fetchData(); 
    } catch (error) { 
      toast.error('Lỗi khi xóa!'); 
    } finally {
      setShowDeleteModal(false);
      setIdToDelete(null);
    }
  };

  // Hành động Chi tiết & Gợi ý
  const handleOpenDetail = (record: any) => { setDetailData(record); setIsDetailVisible(true); };

  const handleOpenSuggest = async (record: any) => {
    setCurrentNhuCau(record); 
    setLoadingSuggest(true); 
    setIsSuggestModalVisible(true);
    try {
      const res = await http.get(`/giao-dich/suggest/${record.id}`);
      const validSuggestions = (res.data.danhSachGoiY || []).filter((bds: any) => !['Đã bán', 'Đang giao dịch', 'Đã cọc'].includes(bds.tinhTrang));
      setSuggestList(validSuggestions);
    } catch (error) { setSuggestList([]); }
    setLoadingSuggest(false);
  };

  // Lọc và Phân trang Bảng chính
  const filteredList = nhuCauList.filter((nc) => {
    if (!searchText) return true;
    const lowerSearch = searchText.toLowerCase();
    const khName = getKhachHangName(nc.khachHangId).toLowerCase();
    return (
      (nc.id && nc.id.toLowerCase().includes(lowerSearch)) ||
      (khName.includes(lowerSearch)) ||
      (nc.viTri && nc.viTri.toLowerCase().includes(lowerSearch))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));

  // Cột cho bảng Gợi ý (Ant Design)
  const suggestColumns = [
    { title: 'MÃ BĐS', dataIndex: 'id', key: 'id', render: (t: any) => <strong style={{ color: GOLD_COLOR }}>{t}</strong> },
    { title: 'ĐỊA CHỈ', dataIndex: 'diaChi', key: 'diaChi' },
    { title: 'DIỆN TÍCH', dataIndex: 'dienTich', key: 'dienTich', render: (v: any) => `${v} m²` },
    { title: 'GIÁ TIỀN', dataIndex: 'giaTien', key: 'giaTien', render: (v: any) => <strong style={{ color: '#52c41a' }}>{Number(v).toLocaleString('vi-VN')} đ</strong> },
    { 
      title: 'ĐỘ PHÙ HỢP', 
      dataIndex: 'matchingScore', 
      key: 'matchingScore',
      width: 180,
      render: (score: number) => {
        let strokeColor = '#ff4d4f'; 
        if (score >= 80) strokeColor = '#52c41a'; 
        else if (score >= 50) strokeColor = '#faad14'; 
        return (
          <Progress percent={score || 0} size="small" strokeColor={strokeColor} format={(p) => <span style={{ color: '#fff', fontWeight: 'bold' }}>{p}%</span>} />
        );
      }
    },
    { title: 'HÀNH ĐỘNG', key: 'action', render: (_: any, bdsRecord: any) => (
      <button 
        style={{ backgroundColor: GOLD_COLOR, color: '#000', fontWeight: 'bold', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
        onClick={() => {
          setIsSuggestModalVisible(false);
          navigate('/admin/giao-dich', { state: { khachHangId: currentNhuCau?.khachHangId, batDongSanId: bdsRecord.id, nhuCauId: currentNhuCau?.id, soTien: bdsRecord.giaTien, benBanId: bdsRecord.khachHangId } });
        }}>
        Tạo Giao dịch <SwapRightOutlined />
      </button>
    )}
  ];

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: GOLD_COLOR, colorBgBase: '#1a1a2e', colorBgContainer: '#16213e', colorTextBase: '#ffffff' } }}>
      <div className="bds-container">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        
        {/* HEADER ĐỒNG BỘ */}
        <div className="bds-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h2>Danh sách Nhu cầu</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Tìm Mã NC, Tên KH, Khu vực..."
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
              + Thêm Nhu cầu
            </button>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU ĐỒNG BỘ */}
        <div className="bds-table-wrapper">
          <table className="bds-table">
            <thead>
              <tr>
                <th>Mã NC</th>
                <th>Khách hàng</th>
                <th>Nhân viên tạo</th>
                <th>Hình thức</th>
                <th>Loại BĐS</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((nc: any) => (
                  <tr key={nc.id}>
                    <td style={{ fontWeight: 'bold' }}>{nc.id}</td>
                    <td style={{ fontWeight: 'bold' }}>{getKhachHangName(nc.khachHangId)}</td>
                    <td>{nc.nhanVienId ? getNhanVienName(nc.nhanVienId) : '—'}</td>
                    <td style={{ color: nc.loaiNC === 'Mua' ? GOLD_COLOR : '#fff', fontWeight: 'bold' }}>{nc.loaiNC}</td>
                    <td>{nc.loaiBDS}</td>
                    <td>
                      <span className={`status ${nc.tinhTrang === 'Đã hoàn thành' ? 'sold' : nc.tinhTrang === 'Đã hủy' ? 'sold' : 'available'}`}
                            style={{ backgroundColor: nc.tinhTrang === 'Đã hoàn thành' ? 'rgba(46, 204, 113, 0.2)' : nc.tinhTrang === 'Đã hủy' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.2)',
                                     color: nc.tinhTrang === 'Đã hoàn thành' ? '#2ecc71' : nc.tinhTrang === 'Đã hủy' ? '#e74c3c' : '#3498db', border: 'none' }}>
                        {nc.tinhTrang || 'Đang tìm kiếm'}
                      </span>
                    </td>
                    <td className="actions" style={{ justifyContent: 'center' }}>
                      <button className="btn-view" onClick={() => handleOpenDetail(nc)}>Xem</button>
                      <button className="btn-edit" onClick={() => handleOpenEdit(nc)}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDeleteClick(nc.id)}>Xóa</button>
                      <button 
                        style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#2ecc71', color: '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }} 
                        onClick={() => handleOpenSuggest(nc)}
                      >
                        <ThunderboltOutlined /> Gợi ý
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                    {searchText ? 'Không tìm thấy nhu cầu nào phù hợp' : 'Không có dữ liệu'}
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
                Bạn có chắc chắn muốn xóa nhu cầu <strong>{idToDelete}</strong> không?<br/> Hành động này không thể hoàn tác!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button onClick={() => { setShowDeleteModal(false); setIdToDelete(null); }} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#95a5a6', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Hủy bỏ</button>
                <button onClick={confirmDelete} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#e74c3c', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Đồng ý xóa</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FORM THÊM/SỬA (Giữ nguyên Ant Design Dark Mode) */}
        <Modal title={<div style={{ color: GOLD_COLOR, fontSize: '18px', paddingBottom: '10px' }}>{editingId ? 'CẬP NHẬT NHU CẦU' : 'TẠO NHU CẦU'}</div>} open={isFormVisible} onCancel={() => setIsFormVisible(false)} footer={null} width={750}>
          <Form form={form} layout="vertical" onFinish={handleFinishForm}>
            <Row gutter={[24, 16]}>
              <Col span={24}><Form.Item name="nhanVienId" label="Mã Nhân viên tạo"><Input placeholder="VD: NV001" /></Form.Item></Col>
              <Col span={24}><Form.Item name="khachHangId" label="Khách Hàng" rules={[{ required: true }]}><Select showSearch placeholder="Tìm tên..." options={khachHangOptions} optionFilterProp="label" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="loaiNC" label="Hình thức" rules={[{ required: true }]}><Select options={[{value: 'Mua', label: 'Mua'}, {value: 'Thuê', label: 'Thuê'}]} /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="loaiBDS" label="Phân loại BĐS" rules={[{ required: true }]}><Select options={[{value: 'Chung cư', label: 'Chung cư'}, {value: 'Nhà phố', label: 'Nhà phố'}, {value: 'Đất nền', label: 'Đất nền'}]} /></Form.Item></Col>
              <Col span={24}><Form.Item name="viTri" label="Khu vực mong muốn" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="dienTichMin" label="Diện tích tối thiểu (m²)"><Input type="number" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="dienTichMax" label="Diện tích tối đa (m²)"><Input type="number" /></Form.Item></Col>
              {editingId && (<Col span={24}><Form.Item name="tinhTrang" label="Trạng thái"><Select options={[{value: 'Đang tìm kiếm', label: 'Đang tìm kiếm'}, {value: 'Đã hoàn thành', label: 'Đã hoàn thành'}, {value: 'Đã hủy', label: 'Đã hủy'}]} /></Form.Item></Col>)}
              <Col span={24}><Form.Item name="ghiChu" label="Ghi chú thêm"><Input.TextArea rows={4} /></Form.Item></Col>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #333' }}>
              <button type="button" onClick={() => setIsFormVisible(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #444', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer' }}>Hủy</button>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: GOLD_COLOR, color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>Lưu thông tin</button>
            </div>
          </Form>
        </Modal>

        {/* MODAL CHI TIẾT (Giữ nguyên UI Đẹp cũ) */}
        <Modal title={<div style={{ color: GOLD_COLOR, textAlign: 'center', fontSize: '22px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>HỒ SƠ NHU CẦU</div>} open={isDetailVisible} onCancel={() => setIsDetailVisible(false)} footer={null} width={800}>
          {detailData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              <div style={{ backgroundColor: '#1a1a2e', padding: '20px', borderRadius: '10px', borderLeft: `5px solid ${GOLD_COLOR}` }}>
                <Row gutter={[24, 24]}>
                  <Col span={12}><div style={{ color: '#aaa', marginBottom: '8px', fontSize: '13px' }}>Mã Nhu Cầu</div><strong style={{ color: GOLD_COLOR, fontSize: '20px' }}>{detailData.id}</strong></Col>
                  <Col span={12} style={{ textAlign: 'right' }}><div style={{ color: '#aaa', marginBottom: '8px', fontSize: '13px' }}>Trạng Thái</div><span style={{ backgroundColor: detailData.tinhTrang === 'Đã hoàn thành' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(52, 152, 219, 0.2)', color: detailData.tinhTrang === 'Đã hoàn thành' ? '#2ecc71' : '#3498db', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}>{detailData.tinhTrang || 'Đang tìm kiếm'}</span></Col>
                </Row>
              </div>
              <div style={{ backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 style={{ color: GOLD_COLOR, fontSize: '17px', marginTop: 0, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px dashed #444' }}><UserOutlined className="mr-2" /> THÔNG TIN ĐỐI TÁC</h3>
                <Row gutter={[32, 24]}>
                  <Col xs={24} md={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Khách Hàng</div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{getKhachHangName(detailData.khachHangId)}</div></Col>
                  <Col xs={24} md={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Nhân Viên Tạo Đơn</div><div style={{ fontSize: '16px' }}>{detailData.nhanVienId ? <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{getNhanVienName(detailData.nhanVienId)}</span> : <span style={{ color: '#888' }}>Chưa rõ</span>}</div></Col>
                </Row>
              </div>
              <div style={{ backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 style={{ color: '#52c41a', fontSize: '17px', marginTop: 0, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px dashed #444' }}><HomeOutlined className="mr-2" /> TIÊU CHÍ BẤT ĐỘNG SẢN</h3>
                <Row gutter={[32, 24]}>
                  <Col xs={24} md={8}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Hình thức</div><div style={{ color: GOLD_COLOR, fontSize: '16px', fontWeight: 'bold' }}>{detailData.loaiNC}</div></Col>
                  <Col xs={24} md={8}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Loại BĐS</div><div style={{ color: '#fff', fontSize: '16px' }}>{detailData.loaiBDS}</div></Col>
                  <Col xs={24} md={8}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Diện tích</div><div style={{ color: '#fff', fontSize: '16px' }}>{detailData.dienTichMin || 0} - {detailData.dienTichMax || '∞'} m²</div></Col>
                  <Col span={24}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Khu vực</div><div style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6' }}>{detailData.viTri}</div></Col>
                </Row>
              </div>
            </div>
          )}
        </Modal>

        {/* MODAL GỢI Ý (Giữ nguyên Table Ant Design để render Progress bar) */}
        <Modal title={<div style={{ color: '#52c41a' }}><ThunderboltOutlined className="mr-2" /> GỢI Ý BẤT ĐỘNG SẢN</div>} open={isSuggestModalVisible} onCancel={() => setIsSuggestModalVisible(false)} footer={null} width={1050}>
          <div className="mt-4">
            {suggestList.length > 0 ? (
              <AntTable columns={suggestColumns} dataSource={suggestList} rowKey="id" loading={loadingSuggest} pagination={{ pageSize: 5 }} bordered scroll={{ x: 'max-content' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#ff4d4f', fontSize: '16px' }}>Không có Bất động sản trống nào phù hợp.</div>
            )}
          </div>
        </Modal>

      </div>
    </ConfigProvider>
  );
}