import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, Select, DatePicker, message, Row, Col, Space, Popconfirm, Tag, Typography, ConfigProvider, theme, Descriptions } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { http } from '../../api/http';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text, Title } = Typography;

export function AdminGiaoDichPage() {
  // Fix cảnh báo Warning của message
  const [messageApi, contextHolder] = message.useMessage();

  const [giaoDichList, setGiaoDichList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  const GOLD_COLOR = '#D4AF37'; 

  const fetchGiaoDich = async () => {
    setLoading(true);
    try {
      const res = await http.get('/giao-dich'); 
      setGiaoDichList(res.data);
    } catch (error) {
      messageApi.error('Không thể tải danh sách giao dịch!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGiaoDich();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsFormVisible(true);
  };

  const handleOpenEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue({
      nhanVienId: record.nhanVienId,
      batDongSanId: record.batDongSanId,
      benMuaId: record.benMua, 
      benBanId: record.benBan, 
      soTien: record.soTien,
      tyLeHoaHong: record.tyLeHoaHong,
      ngayGD: dayjs(record.ngayGD),
      tinhTrang: record.tinhTrang,
      moTaGD: record.moTaGD
    });
    setIsFormVisible(true);
  };

  const handleOpenDetail = (record: any) => {
    setDetailData(record);
    setIsDetailVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await http.delete(`/giao-dich/${id}`);
      messageApi.success('Xóa giao dịch thành công!');
      fetchGiaoDich();
    } catch (error) {
      messageApi.error('Lỗi khi xóa giao dịch!');
    }
  };

  const handleFinishForm = async (values: any) => {
    try {
      // Làm sạch payload, không gửi null để tránh Backend bị lỗi 500
      const payload: any = {
        nhanVienId: values.nhanVienId,
        batDongSanId: values.batDongSanId,
        benMuaId: values.benMuaId,
        soTien: values.soTien ? String(values.soTien) : '0',
        tyLeHoaHong: values.tyLeHoaHong ? Number(values.tyLeHoaHong) : 0,
        ngayGD: values.ngayGD ? values.ngayGD.toISOString() : new Date().toISOString(),
        tinhTrang: values.tinhTrang,
      };

      // Chỉ gán giá trị nếu thực sự có nhập, nếu không thì bỏ qua
      if (values.benBanId && values.benBanId.trim() !== '') {
        payload.benBanId = values.benBanId;
      }
      if (values.moTaGD && values.moTaGD.trim() !== '') {
        payload.moTaGD = values.moTaGD;
      }

      if (editingId) {
        await http.patch(`/giao-dich/${editingId}`, payload);
        messageApi.success('Cập nhật giao dịch thành công!');
      } else {
        await http.post('/giao-dich', payload);
        messageApi.success('Tạo mới giao dịch thành công!');
      }
      setIsFormVisible(false);
      fetchGiaoDich();
    } catch (error) {
      messageApi.error('Lỗi lưu dữ liệu. Vui lòng kiểm tra lại!');
    }
  };

  const renderStatusTag = (status: string) => {
    let color = 'default';
    if (status === 'Thành công' || status === 'Hoàn thành') color = 'success';
    else if (status === 'Đã hủy') color = 'error';
    else if (status === 'Đang xử lý') color = 'warning';
    return <Tag color={color}>{status}</Tag>;
  };

  const columns = [
    { title: 'MÃ GD', dataIndex: 'id', key: 'id', render: (t: any) => <Text strong className="text-white">{t}</Text> },
    { title: 'NHÂN VIÊN', dataIndex: 'nhanVienId', key: 'nhanVienId', render: (t: any) => <span className="text-gray-300">{t}</span> },
    { title: 'BÊN MUA', dataIndex: 'benMua', key: 'benMua', render: (t: any) => <span className="text-gray-300">{t}</span> },
    { title: 'BÊN BÁN', dataIndex: 'benBan', key: 'benBan', render: (t: any) => t ? <span className="text-gray-300">{t}</span> : <Text type="secondary">Trống</Text> },
    { title: 'MÃ BĐS', dataIndex: 'batDongSanId', key: 'batDongSanId', render: (t: any) => <span className="text-gray-300">{t}</span> },
    { title: 'SỐ TIỀN', dataIndex: 'soTien', key: 'soTien', render: (v: any) => <Text style={{ color: GOLD_COLOR }} strong>{Number(v).toLocaleString('vi-VN')} đ</Text> },
    { title: 'NGÀY GD', dataIndex: 'ngayGD', key: 'ngayGD', render: (v: any) => <span className="text-gray-300">{dayjs(v).format('DD/MM/YYYY')}</span> },
    { title: 'TRẠNG THÁI', dataIndex: 'tinhTrang', key: 'tinhTrang', render: (v: string) => renderStatusTag(v) },
    {
      title: 'HÀNH ĐỘNG',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" style={{ color: GOLD_COLOR }} icon={<EyeOutlined />} onClick={() => handleOpenDetail(record)} />
          <Button type="text" style={{ color: GOLD_COLOR }} icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          <Popconfirm title="Xóa giao dịch này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm, 
        token: {
          colorPrimary: GOLD_COLOR,     
          colorBgBase: '#141414',       
          colorBgContainer: '#1f1f1f',  
          colorTextBase: '#ffffff',     
        },
        components: {
          Table: {
            headerColor: GOLD_COLOR,    
            headerBg: '#141414',        
            borderColor: '#333333',     
          },
          Modal: {
            headerBg: '#1f1f1f',
            contentBg: '#1f1f1f',
          },
          Descriptions: {
            colorText: '#ffffff',
            colorTextSecondary: '#aaaaaa',
          }
        }
      }}
    >
      {/* Phải có cái này thì messageApi mới có tác dụng (Fix cảnh báo đỏ) */}
      {contextHolder}

      <div className="p-6 bg-[#141414] min-h-[85vh] text-white">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-4">
          <Title level={3} style={{ margin: 0, color: GOLD_COLOR, textTransform: 'uppercase' }}>
            Giao dịch
          </Title>
          <Space size="middle">
            <Input 
              placeholder="Tìm kiếm mã GD, BĐS..." 
              prefix={<SearchOutlined style={{ color: GOLD_COLOR }} />} 
              style={{ width: '250px', backgroundColor: '#1f1f1f', borderColor: '#333', color: 'white' }}
              allowClear
              onChange={(e) => setSearchText(e.target.value)} 
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleOpenAdd}
              style={{ fontWeight: 600, color: '#000' }}
            >
              Thêm mới
            </Button>
          </Space>
        </div>

        {/* TABLE */}
        <Table 
          columns={columns} 
          dataSource={giaoDichList.filter((i: any) => {
            if (!searchText) return true;
            const text = searchText.toLowerCase();
            const matchId = i?.id ? String(i.id).toLowerCase().includes(text) : false;
            const matchBDS = i?.batDongSanId ? String(i.batDongSanId).toLowerCase().includes(text) : false;
            return matchId || matchBDS;
          })} 
          rowKey="id" 
          loading={loading} 
          bordered
          pagination={{ pageSize: 10 }}
        />

        {/* MODAL THÊM / SỬA */}
        <Modal 
          title={<div style={{ color: GOLD_COLOR, textTransform: 'uppercase', fontSize: '18px' }}>{editingId ? 'Cập nhật Giao dịch' : 'Thêm mới Giao dịch'}</div>} 
          open={isFormVisible} 
          onCancel={() => setIsFormVisible(false)} 
          footer={null} 
          width={750}
          closeIcon={<span style={{ color: '#fff' }}>✖</span>}
        >
          <Form form={form} layout="vertical" onFinish={handleFinishForm}>
            <Row gutter={16}>
              {editingId && (
                <Col span={24}>
                  <Form.Item label={<span className="text-gray-300">Mã giao dịch</span>}>
                    <Input disabled value={editingId} style={{ backgroundColor: '#141414' }} />
                  </Form.Item>
                </Col>
              )}
              <Col span={12}>
                <Form.Item name="nhanVienId" label={<span className="text-gray-300">Mã Nhân viên</span>} rules={[{ required: true, message: 'Nhập mã NV!' }]}>
                  <Input placeholder="VD: NV001" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="batDongSanId" label={<span className="text-gray-300">Mã Bất động sản</span>} rules={[{ required: true, message: 'Nhập mã BĐS!' }]}>
                  <Input placeholder="VD: BDS001" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="benMuaId" label={<span className="text-gray-300">Bên Mua (Mã KH)</span>} rules={[{ required: true, message: 'Nhập mã KH!' }]}>
                  <Input placeholder="VD: KH002" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="benBanId" label={<span className="text-gray-300">Bên Bán (Mã KH)</span>}>
                  <Input placeholder="Tùy chọn..." />
                </Form.Item>
              </Col>
              <Col span={8}>
                {/* Đã đổi addonAfter thành suffix để tắt warning vàng */}
                <Form.Item name="soTien" label={<span className="text-gray-300">Số tiền</span>} rules={[{ required: true, message: 'Nhập số tiền!' }]}>
                  <Input type="number" suffix={<span style={{ color: GOLD_COLOR, fontWeight: 500 }}>VNĐ</span>} placeholder="VD: 2500000" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="tyLeHoaHong" label={<span className="text-gray-300">Hoa hồng (%)</span>}>
                  <Input type="number" step="0.1" placeholder="VD: 3.5" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="ngayGD" label={<span className="text-gray-300">Ngày Giao dịch</span>} rules={[{ required: true, message: 'Chọn ngày!' }]}>
                  <DatePicker format="DD/MM/YYYY" className="w-full" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="tinhTrang" label={<span className="text-gray-300">Trạng thái</span>} rules={[{ required: true, message: 'Chọn trạng thái!' }]}>
                  <Select placeholder="-- Chọn trạng thái --">
                    <Option value="Đang xử lý">Đang xử lý</Option>
                    <Option value="Thành công">Thành công</Option>
                    <Option value="Đã hủy">Đã hủy</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="moTaGD" label={<span className="text-gray-300">Ghi chú</span>}>
                  <Input.TextArea rows={3} placeholder="Mô tả..." style={{ backgroundColor: '#141414' }} />
                </Form.Item>
              </Col>
            </Row>
            
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#333]">
              <Button onClick={() => setIsFormVisible(false)}>Hủy bỏ</Button>
              <Button type="primary" htmlType="submit" style={{ fontWeight: 'bold', color: '#000' }}>
                {editingId ? 'Lưu thay đổi' : 'Tạo mới'}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* MODAL CHI TIẾT */}
        <Modal 
          title={<div style={{ color: GOLD_COLOR, textTransform: 'uppercase', fontSize: '18px' }}>Chi tiết giao dịch</div>}
          open={isDetailVisible} 
          onCancel={() => setIsDetailVisible(false)} 
          footer={null} 
          width={800}
          closeIcon={<span style={{ color: '#fff' }}>✖</span>}
        >
          {detailData && (
            <div className="mt-4">
              <Descriptions bordered column={2} size="middle">
                <Descriptions.Item label={<span style={{ color: GOLD_COLOR, fontWeight: 'bold' }}>Dữ liệu giao dịch</span>} span={1}>
                  <div className="space-y-2">
                    <div>Mã NV: <strong>{detailData.nhanVienId}</strong></div>
                    <div>Bên mua: <strong>{detailData.benMua}</strong></div>
                    <div>Bên bán: <strong>{detailData.benBan || 'Không có'}</strong></div>
                    <div>Tổng giá trị: <strong>{Number(detailData.soTien).toLocaleString('vi-VN')} đ</strong></div>
                    <div>Ngày GD: <strong>{dayjs(detailData.ngayGD).format('DD/MM/YYYY')}</strong></div>
                    <div>Phần trăm HH: <strong>{detailData.tyLeHoaHong}%</strong></div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{ color: GOLD_COLOR, fontWeight: 'bold' }}>Thông tin nhà đất</span>} span={1}>
                  <div className="space-y-2">
                    <div>Mã BĐS: <strong>{detailData.batDongSanId}</strong></div>
                    <div>Trạng thái: {renderStatusTag(detailData.tinhTrang)}</div>
                    <div className="mt-4">
                      <span className="text-gray-400 block mb-1">Ghi chú thêm:</span>
                      <div style={{ backgroundColor: '#141414', border: '1px solid #333', padding: '8px', borderRadius: '6px', minHeight: '60px' }}>
                        {detailData.moTaGD || 'Không có ghi chú nào.'}
                      </div>
                    </div>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
}