import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Input, Modal, Form, Select, message, Row, Col, Space, Typography, ConfigProvider, theme, Tag, Popconfirm, Progress } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined, SwapRightOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
import { http } from '../../api/http';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Text, Title } = Typography;

export function AdminNhuCauPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [nhuCauList, setNhuCauList] = useState<any[]>([]);
  const [khachHangList, setKhachHangList] = useState<any[]>([]); 
  const [nhanVienList, setNhanVienList] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  const [isSuggestModalVisible, setIsSuggestModalVisible] = useState(false);
  const [suggestList, setSuggestList] = useState<any[]>([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [currentNhuCau, setCurrentNhuCau] = useState<any>(null);

  const GOLD_COLOR = '#D4AF37'; 

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resNC, resKH, resNV] = await Promise.all([http.get('/nhu-cau'), http.get('/khach-hang'), http.get('/nhan-vien')]);
      setNhuCauList(resNC.data); setKhachHangList(resKH.data); setNhanVienList(resNV.data);
    } catch (error) { messageApi.error('Không thể tải dữ liệu!'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // HÀM MỚI: CẬP NHẬT TRẠNG THÁI NHANH CHO ADMIN
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await http.patch(`/nhu-cau/${id}`, { tinhTrang: newStatus });
      messageApi.success('Cập nhật trạng thái thành công!');
      fetchData();
    } catch (error) {
      messageApi.error('Lỗi cập nhật trạng thái!');
    }
  };

  const getKhachHangName = (id: string) => { const kh = khachHangList.find(k => k.id === id); return kh ? `${kh.hoTen} (${id})` : id; };
  const getNhanVienName = (id: string) => { const nv = nhanVienList.find(n => n.id === id || n.maNV === id); return nv ? `${nv.hoTen} (${id})` : id; };
  const khachHangOptions = useMemo(() => khachHangList.map(kh => ({ value: kh.id, label: `${kh.hoTen} (${kh.id})` })), [khachHangList]);

  const handleOpenAdd = () => { setEditingId(null); form.resetFields(); setIsFormVisible(true); };

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

  const handleDelete = async (id: string) => {
    try { await http.delete(`/nhu-cau/${id}`); messageApi.success('Đã xóa!'); fetchData(); } catch (error) { messageApi.error('Lỗi xóa!'); }
  };

  const handleOpenDetail = (record: any) => { setDetailData(record); setIsDetailVisible(true); };

  const handleOpenSuggest = async (record: any) => {
    setCurrentNhuCau(record); setLoadingSuggest(true); setIsSuggestModalVisible(true);
    try {
      const res = await http.get(`/giao-dich/suggest/${record.id}`);
      const validSuggestions = (res.data.danhSachGoiY || []).filter((bds: any) => !['Đã bán', 'Đang giao dịch', 'Đã cọc'].includes(bds.tinhTrang));
      setSuggestList(validSuggestions);
    } catch (error) { setSuggestList([]); }
    setLoadingSuggest(false);
  };

  const handleFinishForm = async (values: any) => {
    try {
      const payload: any = {
        nhanVienId: values.nhanVienId, khachHangId: values.khachHangId,
        loaiNhuCau: values.loaiNC, loaiBDS: values.loaiBDS, viTri: values.viTri,
        dienTichMin: values.dienTichMin ? Number(values.dienTichMin) : null, dienTichMax: values.dienTichMax ? Number(values.dienTichMax) : null,
        ghiChu: values.ghiChu, tinhTrang: values.tinhTrang || 'Đang tìm kiếm'
      };

      if (editingId) { await http.patch(`/nhu-cau/${editingId}`, payload); messageApi.success('Đã cập nhật!'); } 
      else { await http.post('/nhu-cau', payload); messageApi.success('Tạo mới thành công!'); }
      setIsFormVisible(false); fetchData();
    } catch (error) { messageApi.error('Lỗi khi lưu!'); }
  };
  
  const renderStatusTag = (status: string) => {
    let color = 'processing'; // Xanh dương sáng mặc định cho "Đang tìm kiếm"
    
    if (status === 'Đã hoàn thành') {
      color = 'success'; // Xanh lá
    } else if (status === 'Đã hủy') {
      color = 'error'; // Đỏ
    }

    return (
      <Tag 
        color={color} 
        style={{ padding: '4px 12px', fontSize: '13px', fontWeight: 'bold' }}
      >
        {status || 'Đang tìm kiếm'}
      </Tag>
    );
  };

  const columns = [
    { title: 'MÃ NC', dataIndex: 'id', key: 'id', render: (t: any) => <Text strong className="text-white">{t}</Text> },
    { title: 'KHÁCH HÀNG', dataIndex: 'khachHangId', key: 'khachHangId', render: (t: any) => <span className="text-white font-semibold">{getKhachHangName(t)}</span> },
    { title: 'NHÂN VIÊN TẠO', dataIndex: 'nhanVienId', key: 'nhanVienId', render: (t: any) => <span className="text-gray-400">{t ? getNhanVienName(t) : 'Chưa rõ'}</span> },
    { title: 'HÌNH THỨC', dataIndex: 'loaiNC', key: 'loaiNC', render: (v: string) => <Text style={{ color: v === 'Mua' ? GOLD_COLOR : '#fff' }} strong>{v}</Text> },
    { title: 'LOẠI BĐS', dataIndex: 'loaiBDS', key: 'loaiBDS', render: (t: any) => <span className="text-gray-300">{t}</span> },
    // ĐÃ SỬA: Đổi từ Tag cứng thành Select để Admin tự chọn trạng thái
    { 
      title: 'TRẠNG THÁI', 
      dataIndex: 'tinhTrang', 
      key: 'tinhTrang', 
      render: (v: string) => renderStatusTag(v) 
    },
    { title: 'HÀNH ĐỘNG', key: 'action', width: 250, render: (_: any, record: any) => (
      <Space size="small">
        <Button type="text" icon={<EyeOutlined />} style={{ color: GOLD_COLOR }} onClick={() => handleOpenDetail(record)} />
        <Button type="text" icon={<EditOutlined />} style={{ color: GOLD_COLOR }} onClick={() => handleOpenEdit(record)} />
        <Popconfirm title="Xóa nhu cầu này?" onConfirm={() => handleDelete(record.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
        <Button type="primary" size="small" icon={<ThunderboltOutlined />} style={{ backgroundColor: '#52c41a', color: '#000', fontWeight: 'bold' }} onClick={() => handleOpenSuggest(record)}>Gợi ý</Button>
      </Space>
    )}
  ];

  const suggestColumns = [
    { title: 'MÃ BĐS', dataIndex: 'id', key: 'id', render: (t: any) => <Text strong style={{ color: GOLD_COLOR }}>{t}</Text> },
    { title: 'ĐỊA CHỈ', dataIndex: 'diaChi', key: 'diaChi' },
    { title: 'DIỆN TÍCH', dataIndex: 'dienTich', key: 'dienTich', render: (v: any) => `${v} m²` },
    { title: 'GIÁ TIỀN', dataIndex: 'giaTien', key: 'giaTien', render: (v: any) => <Text type="success" strong>{Number(v).toLocaleString('vi-VN')} đ</Text> },
    { 
      title: 'ĐỘ PHÙ HỢP', 
      dataIndex: 'matchingScore', 
      key: 'matchingScore',
      width: 180,
      render: (score: number) => {
        let strokeColor = '#ff4d4f'; // Dưới 50đ -> Màu Đỏ (Lệch nhiều)
        if (score >= 80) strokeColor = '#52c41a'; // Trên 80đ -> Màu Xanh lá (Cực kỳ khớp)
        else if (score >= 50) strokeColor = '#faad14'; // Từ 50 - 79đ -> Màu Vàng (Khá khớp)
        
        return (
          <Progress 
            percent={score || 0} 
            size="small" 
            strokeColor={strokeColor}
            // Fix màu chữ % cho nó sáng lên trong nền đen
            format={(percent) => <span style={{ color: '#fff', fontWeight: 'bold' }}>{percent}%</span>}
          />
        );
      }
    },
    { title: 'HÀNH ĐỘNG', key: 'action', render: (_: any, bdsRecord: any) => (
      <Button type="primary" size="small" icon={<SwapRightOutlined />} style={{ backgroundColor: GOLD_COLOR, color: '#000', fontWeight: 'bold' }}
        onClick={() => {
          setIsSuggestModalVisible(false);
          navigate('/admin/giao-dich', { state: { khachHangId: currentNhuCau?.khachHangId, batDongSanId: bdsRecord.id, nhuCauId: currentNhuCau?.id, soTien: bdsRecord.giaTien, benBanId: bdsRecord.khachHangId } });
        }}>Tạo Giao dịch</Button>
    )}
  ];

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: GOLD_COLOR, colorBgBase: '#141414', colorBgContainer: '#1f1f1f', colorTextBase: '#ffffff' } }}>
      {contextHolder}
      <div className="p-6 bg-[#141414] min-h-[85vh] text-white">
        <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-4">
          <Title level={3} style={{ margin: 0, color: GOLD_COLOR }}>Quản lý Nhu cầu</Title>
          <Space><Input placeholder="Tìm kiếm..." prefix={<SearchOutlined style={{ color: GOLD_COLOR }} />} style={{ width: '250px' }} onChange={(e) => setSearchText(e.target.value)} /><Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} style={{ fontWeight: 600, color: '#000' }}>Thêm mới</Button></Space>
        </div>
        <Table columns={columns} dataSource={nhuCauList.filter((i: any) => !searchText || i?.id?.toLowerCase().includes(searchText.toLowerCase()) || i?.khachHangId?.toLowerCase().includes(searchText.toLowerCase()))} rowKey="id" loading={loading} bordered pagination={{ pageSize: 10 }} />

        <Modal title={<div style={{ color: GOLD_COLOR, fontSize: '18px', paddingBottom: '10px' }}>{editingId ? 'CẬP NHẬT NHU CẦU' : 'TẠO NHU CẦU'}</div>} open={isFormVisible} onCancel={() => setIsFormVisible(false)} footer={null} width={750}>
          <Form form={form} layout="vertical" onFinish={handleFinishForm}>
            <Row gutter={[24, 16]}>
              <Col span={24}><Form.Item name="nhanVienId" label="Mã Nhân viên tạo"><Input placeholder="VD: NV001" /></Form.Item></Col>
              <Col span={24}><Form.Item name="khachHangId" label="Khách Hàng" rules={[{ required: true }]}><Select showSearch placeholder="Tìm tên..." options={khachHangOptions} optionFilterProp="label" /></Form.Item></Col>
              <Col span={12}><Form.Item name="loaiNC" label="Hình thức" rules={[{ required: true }]}><Select options={[{value: 'Mua', label: 'Mua'}, {value: 'Thuê', label: 'Thuê'}]} /></Form.Item></Col>
              <Col span={12}><Form.Item name="loaiBDS" label="Phân loại BĐS" rules={[{ required: true }]}><Select options={[{value: 'Chung cư', label: 'Chung cư'}, {value: 'Nhà phố', label: 'Nhà phố'}, {value: 'Đất nền', label: 'Đất nền'}]} /></Form.Item></Col>
              <Col span={24}><Form.Item name="viTri" label="Khu vực mong muốn" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="dienTichMin" label="Diện tích tối thiểu (m²)"><Input type="number" /></Form.Item></Col>
              <Col span={12}><Form.Item name="dienTichMax" label="Diện tích tối đa (m²)"><Input type="number" /></Form.Item></Col>
              {editingId && (<Col span={24}><Form.Item name="tinhTrang" label="Trạng thái"><Select options={[{value: 'Đang tìm kiếm', label: 'Đang tìm kiếm'}, {value: 'Đã hoàn thành', label: 'Đã hoàn thành'}, {value: 'Đã hủy', label: 'Đã hủy'}]} /></Form.Item></Col>)}
              <Col span={24}><Form.Item name="ghiChu" label="Ghi chú thêm"><Input.TextArea rows={4} /></Form.Item></Col>
            </Row>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#333]"><Button onClick={() => setIsFormVisible(false)}>Hủy</Button><Button type="primary" htmlType="submit" style={{ color: '#000' }}>Lưu thông tin</Button></div>
          </Form>
        </Modal>

        {/* MODAL CHI TIẾT - CĂN CHỈNH KHOẢNG CÁCH RỘNG */}
        <Modal title={<div style={{ color: GOLD_COLOR, textAlign: 'center', fontSize: '22px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>HỒ SƠ NHU CẦU</div>} open={isDetailVisible} onCancel={() => setIsDetailVisible(false)} footer={null} width={800}>
          {detailData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', borderLeft: `5px solid ${GOLD_COLOR}` }}>
                <Row gutter={[24, 24]}>
                  <Col span={12}><Text className="text-gray-400 block" style={{ marginBottom: '8px', fontSize: '13px' }}>Mã Nhu Cầu</Text><Text strong style={{ color: GOLD_COLOR, fontSize: '20px' }}>{detailData.id}</Text></Col>
                  <Col span={12} style={{ textAlign: 'right' }}><Text className="text-gray-400 block" style={{ marginBottom: '8px', fontSize: '13px' }}>Trạng Thái</Text><Tag color={detailData.tinhTrang === 'Đã hoàn thành' ? 'success' : 'processing'} style={{ padding: '4px 12px', fontSize: '14px' }}>{detailData.tinhTrang || 'Đang tìm kiếm'}</Tag></Col>
                </Row>
              </div>
              <div style={{ backgroundColor: '#1a1a1a', padding: '24px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 style={{ color: GOLD_COLOR, fontSize: '17px', marginTop: 0, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px dashed #444' }}><UserOutlined className="mr-2" /> THÔNG TIN ĐỐI TÁC</h3>
                <Row gutter={[32, 24]}>
                  <Col span={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Khách Hàng</div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{getKhachHangName(detailData.khachHangId)}</div></Col>
                  <Col span={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Nhân Viên Tạo Đơn</div><div style={{ fontSize: '16px' }}>{detailData.nhanVienId ? <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{getNhanVienName(detailData.nhanVienId)}</span> : <span style={{ color: '#888' }}>Chưa rõ</span>}</div></Col>
                </Row>
              </div>
              <div style={{ backgroundColor: '#1a1a1a', padding: '24px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 style={{ color: '#52c41a', fontSize: '17px', marginTop: 0, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px dashed #444' }}><HomeOutlined className="mr-2" /> TIÊU CHÍ BẤT ĐỘNG SẢN</h3>
                <Row gutter={[32, 24]}>
                  <Col span={8}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Hình thức</div><div style={{ color: GOLD_COLOR, fontSize: '16px', fontWeight: 'bold' }}>{detailData.loaiNC}</div></Col>
                  <Col span={8}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Loại BĐS</div><div style={{ color: '#fff', fontSize: '16px' }}>{detailData.loaiBDS}</div></Col>
                  <Col span={8}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Diện tích</div><div style={{ color: '#fff', fontSize: '16px' }}>{detailData.dienTichMin || 0} - {detailData.dienTichMax || '∞'} m²</div></Col>
                  <Col span={24}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Khu vực</div><div style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6' }}>{detailData.viTri}</div></Col>
                </Row>
              </div>
            </div>
          )}
        </Modal>

        <Modal title={<div style={{ color: '#52c41a' }}><ThunderboltOutlined className="mr-2" /> GỢI Ý BẤT ĐỘNG SẢN</div>} open={isSuggestModalVisible} onCancel={() => setIsSuggestModalVisible(false)} footer={null} width={1050}>
          <div className="mt-4">{suggestList.length > 0 ? <Table columns={suggestColumns} dataSource={suggestList} rowKey="id" loading={loadingSuggest} pagination={{ pageSize: 5 }} bordered /> : <div className="text-center py-10"><Text style={{ color: '#ff4d4f', fontSize: '16px' }}>Không có Bất động sản trống nào phù hợp.</Text></div>}</div>
        </Modal>
      </div>
    </ConfigProvider>
  );
}