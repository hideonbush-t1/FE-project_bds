import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Input, Modal, Form, Select, DatePicker, message, Row, Col, Space, Popconfirm, Tag, Typography, ConfigProvider, theme } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, UserOutlined, HomeOutlined, DollarOutlined } from '@ant-design/icons';
import { http } from '../../api/http';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom'; 

const { Option } = Select;
const { Text, Title } = Typography;

export function AdminGiaoDichPage() {
  const location = useLocation(); 
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [giaoDichList, setGiaoDichList] = useState<any[]>([]);
  const [khachHangList, setKhachHangList] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [associatedNhuCauId, setAssociatedNhuCauId] = useState<string | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [pendingInitData, setPendingInitData] = useState<any>(null);

  const GOLD_COLOR = '#D4AF37'; 

  useEffect(() => {
    if (location.state && location.state.khachHangId) {
      setPendingInitData(location.state);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resGD, resKH] = await Promise.all([http.get('/giao-dich'), http.get('/khach-hang')]);
      setGiaoDichList(resGD.data); setKhachHangList(resKH.data);
    } catch (error) { messageApi.error('Lỗi tải dữ liệu!'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (pendingInitData && khachHangList.length > 0) {
      setEditingId(null); form.resetFields();
      form.setFieldsValue({
        benMuaId: pendingInitData.khachHangId, benBanId: pendingInitData.benBanId || null,
        batDongSanId: pendingInitData.batDongSanId, soTien: pendingInitData.soTien || undefined,
        tinhTrang: 'Đang xử lý'
      });
      if (pendingInitData.nhuCauId) setAssociatedNhuCauId(pendingInitData.nhuCauId);
      setIsFormVisible(true); setPendingInitData(null);
    }
  }, [pendingInitData, khachHangList, form]);

  const getKhachHangName = (id: string) => { const kh = khachHangList.find(k => k.id === id); return kh ? `${kh.hoTen} (${id})` : id; };
  const khachHangOptions = useMemo(() => khachHangList.map(kh => ({ value: kh.id, label: `${kh.hoTen} (${kh.id})` })), [khachHangList]);

  const handleOpenAdd = () => { setEditingId(null); setAssociatedNhuCauId(null); form.resetFields(); setIsFormVisible(true); };

  const handleOpenEdit = (record: any) => {
    setEditingId(record.id); setAssociatedNhuCauId(null);
    form.setFieldsValue({
      nhanVienId: record.nhanVienId, batDongSanId: record.batDongSanId,
      benMuaId: record.benMua, benBanId: record.benBan, soTien: record.soTien,
      tyLeHoaHong: record.tyLeHoaHong, ngayGD: dayjs(record.ngayGD),
      tinhTrang: record.tinhTrang, moTaGD: record.moTaGD
    });
    setIsFormVisible(true);
  };

  // ĐÃ SỬA: Đổi id thành record, cập nhật trạng thái BĐS về Trống trước khi xóa
  const handleDelete = async (record: any) => {
    try { 
      await http.patch(`/bat-dong-san/${record.batDongSanId}`, { tinhTrang: 'Trống' });
      await http.delete(`/giao-dich/${record.id}`); 
      messageApi.success('Đã xóa giao dịch và hoàn lại BĐS vào kho!'); 
      fetchData(); 
    } catch (error) { 
      messageApi.error('Lỗi xóa!'); 
    }
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
        messageApi.success('Đã cập nhật!'); 
      } else { 
        await http.post('/giao-dich', payload); 
        messageApi.success('Đã tạo mới!'); 
      }

      // ĐÃ SỬA: Tách logic đồng bộ BĐS ra ngoài để chạy cho CẢ TẠO MỚI VÀ CẬP NHẬT
      try {
        if (values.tinhTrang === 'Đã hủy') {
          // Hủy đơn -> Trả BĐS về Trống
          await http.patch(`/bat-dong-san/${values.batDongSanId}`, { tinhTrang: 'Trống' });
        } else if (values.tinhTrang === 'Thành công') {
          // Thành công -> BĐS Đã bán, Nhu Cầu Đã hoàn thành
          await http.patch(`/bat-dong-san/${values.batDongSanId}`, { tinhTrang: 'Đã bán' });
          if (associatedNhuCauId) await http.patch(`/nhu-cau/${associatedNhuCauId}`, { tinhTrang: 'Đã hoàn thành' });
        } else {
          // Đang xử lý -> BĐS Đang giao dịch
          await http.patch(`/bat-dong-san/${values.batDongSanId}`, { tinhTrang: 'Đang giao dịch' });
        }
      } catch (e) {
        console.error("Lỗi đồng bộ tự động:", e);
      }

      setIsFormVisible(false); fetchData();
    } catch (error) { messageApi.error('Lỗi lưu dữ liệu!'); }
  };

  const renderStatusTag = (status: string) => {
    let color = 'processing'; 
    if (status === 'Thành công' || status === 'Hoàn thành') {
      color = 'success';
    } else if (status === 'Đã hủy' || status === 'Thất bại') {
      color = 'error'; 
    } else if (status === 'Đang xử lý') {
      color = 'warning'; 
    }

    return (
      <Tag color={color} style={{ padding: '4px 12px', fontSize: '13px', fontWeight: 'bold' }}>
        {status || 'Không rõ'}
      </Tag>
    );
  };

  const columns = [
    { title: 'MÃ GD', dataIndex: 'id', key: 'id', render: (t: any) => <Text strong className="text-white">{t}</Text> },
    { title: 'BÊN MUA', dataIndex: 'benMua', key: 'benMua', render: (t: any) => <span className="text-gray-300">{getKhachHangName(t)}</span> },
    { title: 'BÊN BÁN', dataIndex: 'benBan', key: 'benBan', render: (t: any) => <span className="text-gray-300">{t ? getKhachHangName(t) : 'Trống'}</span> },
    { title: 'MÃ BĐS', dataIndex: 'batDongSanId', key: 'batDongSanId', render: (t: any) => <span style={{ color: GOLD_COLOR }}>{t}</span> },
    { title: 'SỐ TIỀN', dataIndex: 'soTien', key: 'soTien', render: (v: any) => <Text className="text-white" strong>{Number(v).toLocaleString('vi-VN')} đ</Text> },
    { title: 'TRẠNG THÁI', dataIndex: 'tinhTrang', key: 'tinhTrang', render: (v: string) => renderStatusTag(v) },
    { title: 'HÀNH ĐỘNG', key: 'action', render: (_: any, record: any) => (
      <Space size="middle">
        <Button type="text" style={{ color: GOLD_COLOR }} icon={<EyeOutlined />} onClick={() => { setDetailData(record); setIsDetailVisible(true); }} />
        <Button type="text" style={{ color: GOLD_COLOR }} icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
        {/* ĐÃ SỬA: Đổi record.id thành record để hàm handleDelete có thể lấy batDongSanId */}
        <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    )}
  ];

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: GOLD_COLOR, colorBgBase: '#141414', colorBgContainer: '#1f1f1f', colorTextBase: '#ffffff' } }}>
      {contextHolder}
      <div className="p-6 bg-[#141414] min-h-[85vh] text-white">
        <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-4">
          <Title level={3} style={{ margin: 0, color: GOLD_COLOR }}>Quản lý Giao dịch</Title>
          <Space><Input placeholder="Tìm kiếm..." prefix={<SearchOutlined style={{ color: GOLD_COLOR }} />} style={{ width: '250px' }} onChange={(e) => setSearchText(e.target.value)} /><Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} style={{ fontWeight: 600, color: '#000' }}>Thêm mới</Button></Space>
        </div>
        <Table columns={columns} dataSource={giaoDichList.filter((i: any) => !searchText || i?.id?.toLowerCase().includes(searchText.toLowerCase()) || i?.batDongSanId?.toLowerCase().includes(searchText.toLowerCase()))} rowKey="id" loading={loading} bordered pagination={{ pageSize: 10 }} />

        <Modal title={<div style={{ color: GOLD_COLOR, fontSize: '18px', paddingBottom: '10px' }}>{editingId ? 'CẬP NHẬT GIAO DỊCH' : 'TẠO GIAO DỊCH MỚI'}</div>} open={isFormVisible} onCancel={() => setIsFormVisible(false)} footer={null} width={800}>
          <Form form={form} layout="vertical" onFinish={handleFinishForm}>
            <Row gutter={[24, 16]}>
              <Col span={12}><Form.Item name="nhanVienId" label="Mã Nhân viên tạo" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="batDongSanId" label="Mã Bất động sản" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="benMuaId" label="Bên Mua (Khách hàng)" rules={[{ required: true }]}><Select showSearch placeholder="Tìm tên..." options={khachHangOptions} optionFilterProp="label" /></Form.Item></Col>
              <Col span={12}><Form.Item name="benBanId" label="Bên Bán (Chủ nhà)"><Select showSearch allowClear placeholder="Tìm tên..." options={khachHangOptions} optionFilterProp="label" /></Form.Item></Col>
              
              <Col span={8}>
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
              <Col span={8}><Form.Item name="tyLeHoaHong" label="Hoa hồng (%)"><Input type="number" step="0.1" /></Form.Item></Col>
              <Col span={8}><Form.Item name="ngayGD" label="Ngày Giao dịch" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" className="w-full" /></Form.Item></Col>
              <Col span={24}><Form.Item name="tinhTrang" label="Trạng thái" rules={[{ required: true }]}><Select options={[{ label: 'Đang xử lý', value: 'Đang xử lý' }, { label: 'Thành công', value: 'Thành công' }, { label: 'Đã hủy', value: 'Đã hủy' }]} /></Form.Item></Col>
              <Col span={24}><Form.Item name="moTaGD" label="Ghi chú"><Input.TextArea rows={4} /></Form.Item></Col>
            </Row>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#333]"><Button onClick={() => setIsFormVisible(false)}>Hủy bỏ</Button><Button type="primary" htmlType="submit" style={{ color: '#000' }}>Lưu thông tin</Button></div>
          </Form>
        </Modal>

        <Modal title={<div style={{ color: GOLD_COLOR, textAlign: 'center', fontSize: '22px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>HỒ SƠ GIAO DỊCH</div>} open={isDetailVisible} onCancel={() => setIsDetailVisible(false)} footer={null} width={800}>
          {detailData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>MÃ GIAO DỊCH</div><div style={{ color: GOLD_COLOR, fontSize: '20px', fontWeight: 'bold' }}>{detailData.id}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>TRẠNG THÁI</div><div>{renderStatusTag(detailData.tinhTrang)}</div></div>
              </div>
              <div style={{ backgroundColor: '#1a1a1a', padding: '24px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 style={{ color: GOLD_COLOR, fontSize: '17px', marginTop: 0, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px dashed #444' }}><UserOutlined className="mr-2" /> THÔNG TIN CÁC BÊN</h3>
                <Row gutter={[32, 24]}>
                  <Col span={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Bên Mua (Khách hàng)</div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{getKhachHangName(detailData.benMua)}</div></Col>
                  <Col span={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Bên Bán (Chủ nhà)</div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{detailData.benBan ? getKhachHangName(detailData.benBan) : 'Không có'}</div></Col>
                  <Col span={24}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Nhân viên chốt đơn</div><div style={{ color: '#fff', fontSize: '16px' }}>{detailData.nhanVienId}</div></Col>
                </Row>
              </div>
              <div style={{ backgroundColor: '#1a1a1a', padding: '24px', borderRadius: '10px', border: '1px solid #333' }}>
                <h3 style={{ color: '#52c41a', fontSize: '17px', marginTop: 0, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px dashed #444' }}><DollarOutlined className="mr-2" /> BẤT ĐỘNG SẢN & TÀI CHÍNH</h3>
                <Row gutter={[32, 24]}>
                  <Col span={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Mã Bất Động Sản</div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}><HomeOutlined /> {detailData.batDongSanId}</div></Col>
                  <Col span={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Ngày Giao Dịch</div><div style={{ color: '#fff', fontSize: '16px' }}>{dayjs(detailData.ngayGD).format('DD/MM/YYYY')}</div></Col>
                  <Col span={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Số Tiền Thỏa Thuận</div><div style={{ color: GOLD_COLOR, fontSize: '22px', fontWeight: 'bold' }}>{Number(detailData.soTien).toLocaleString('vi-VN')} VNĐ</div></Col>
                  <Col span={12}><div style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Tỷ lệ Hoa hồng</div><div style={{ color: '#fff', fontSize: '16px' }}>{detailData.tyLeHoaHong}%</div></Col>
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