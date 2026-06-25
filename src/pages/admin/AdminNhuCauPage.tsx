import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, Select, message, Row, Col, Space, Typography, Descriptions, ConfigProvider, theme, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { http } from '../../api/http';

const { Option } = Select;
const { Text, Title } = Typography;

export function AdminNhuCauPage() {
  const [nhuCauList, setNhuCauList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [form] = Form.useForm();

  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  // --- STATE CHO TÍNH NĂNG GỢI Ý (MATCHING) ---
  const [isSuggestModalVisible, setIsSuggestModalVisible] = useState(false);
  const [suggestList, setSuggestList] = useState<any[]>([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [currentNhuCau, setCurrentNhuCau] = useState<any>(null);

  const GOLD_COLOR = '#D4AF37'; 

  const fetchNhuCau = async () => {
    setLoading(true);
    try {
      const res = await http.get('/nhu-cau'); 
      setNhuCauList(res.data);
    } catch (error) {
      message.error('Không thể tải danh sách nhu cầu!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNhuCau();
  }, []);

  const handleOpenAdd = () => {
    form.resetFields();
    setIsFormVisible(true);
  };

  const handleOpenDetail = (record: any) => {
    setDetailData(record);
    setIsDetailVisible(true);
  };

  // --- HÀM XỬ LÝ NÚT GỢI Ý BẤT ĐỘNG SẢN ---
  const handleOpenSuggest = async (record: any) => {
    setCurrentNhuCau(record);
    setLoadingSuggest(true);
    setIsSuggestModalVisible(true);
    try {
      // Gọi API matching (Tùy theo endpoint Backend bạn định nghĩa, ví dụ: /giao-dich/suggest/:id)
      const res = await http.get(`/giao-dich/suggest/${record.id}`);
      // Dựa theo cấu trúc backend trả về: { thongTinNhuCau, soLuongPhuHop, danhSachGoiY }
      setSuggestList(res.data.danhSachGoiY || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách gợi ý. Kiểm tra lại Backend!');
      setSuggestList([]);
    }
    setLoadingSuggest(false);
  };

  const handleFinishForm = async (values: any) => {
    try {
      await http.post('/nhu-cau', values);
      message.success('Đã lưu nhu cầu thành công!');
      setIsFormVisible(false);
      fetchNhuCau();
    } catch (error) {
      message.error('Lỗi khi tạo nhu cầu mới!');
    }
  };

  // Cột cho bảng Danh sách Nhu Cầu
  const columns = [
    { title: 'MÃ NC', dataIndex: 'id', key: 'id', render: (t: any) => <Text strong className="text-white">{t}</Text> },
    { title: 'KHÁCH HÀNG', dataIndex: 'khachHangId', key: 'khachHangId', render: (t: any) => <span className="text-white font-semibold">{t}</span> },
    { 
      title: 'HÌNH THỨC', 
      dataIndex: 'loaiNC', 
      key: 'loaiNC', 
      render: (v: string) => <Text style={{ color: v === 'Mua' ? GOLD_COLOR : '#fff' }} strong>{v}</Text> 
    },
    { title: 'LOẠI BĐS', dataIndex: 'loaiBDS', key: 'loaiBDS', render: (t: any) => <span className="text-gray-300">{t}</span> },
    { title: 'KHU VỰC', dataIndex: 'viTri', key: 'viTri', render: (t: any) => <span className="text-gray-300">{t}</span> },
    { 
      title: 'DIỆN TÍCH', 
      key: 'dienTich', 
      render: (_: any, record: any) => <span className="text-gray-300">{record.dienTichMin || 0} - {record.dienTichMax || '∞'} m²</span> 
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            style={{ color: GOLD_COLOR }}
            onClick={() => handleOpenDetail(record)}
          >
            Xem
          </Button>
          {/* NÚT THỰC HIỆN TASK MATCHING GỢI Ý */}
          <Button 
            type="primary" 
            size="small"
            icon={<ThunderboltOutlined />} 
            style={{ backgroundColor: '#52c41a', color: '#000', fontWeight: 'bold' }} // Màu xanh lá nổi bật
            onClick={() => handleOpenSuggest(record)}
          >
            Gợi ý BĐS
          </Button>
        </Space>
      ),
    },
  ];

  // Cột cho bảng hiển thị danh sách BĐS được gợi ý trong Modal
  const suggestColumns = [
    { title: 'MÃ BĐS', dataIndex: 'id', key: 'id', render: (t: any) => <Text strong style={{ color: GOLD_COLOR }}>{t}</Text> },
    { title: 'ĐỊA CHỈ', dataIndex: 'diaChi', key: 'diaChi' },
    { title: 'DIỆN TÍCH', dataIndex: 'dienTich', key: 'dienTich', render: (v: any) => `${v} m²` },
    { title: 'GIÁ TIỀN', dataIndex: 'giaTien', key: 'giaTien', render: (v: any) => <Text type="success" strong>{Number(v).toLocaleString('vi-VN')} đ</Text> },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm, 
        token: { colorPrimary: GOLD_COLOR, colorBgBase: '#141414', colorBgContainer: '#1f1f1f', colorTextBase: '#ffffff' },
        components: {
          Table: { headerColor: GOLD_COLOR, headerBg: '#141414', borderColor: '#333333' },
          Modal: { headerBg: '#1f1f1f', contentBg: '#1f1f1f' },
          Descriptions: { colorText: '#ffffff', colorTextSecondary: '#aaaaaa' }
        }
      }}
    >
      <div className="p-6 bg-[#141414] min-h-[85vh] text-white">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-4">
          <Title level={3} style={{ margin: 0, color: GOLD_COLOR, textTransform: 'uppercase' }}>
            Nhu cầu khách hàng
          </Title>
          <Space size="middle">
            <Input 
              placeholder="Tìm kiếm..." 
              prefix={<SearchOutlined style={{ color: GOLD_COLOR }} />} 
              style={{ width: '250px', backgroundColor: '#1f1f1f', borderColor: '#333', color: 'white' }}
              onChange={(e) => setSearchText(e.target.value)} 
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} style={{ fontWeight: 600, color: '#000' }}>
              Thêm mới
            </Button>
          </Space>
        </div>

        {/* TABLE CHÍNH */}
        <Table 
          columns={columns} 
          dataSource={nhuCauList.filter((i: any) => {
            if (!searchText) return true;
            const text = searchText.toLowerCase();
            return i?.id?.toLowerCase().includes(text) || i?.khachHangId?.toLowerCase().includes(text);
          })} 
          rowKey="id" 
          loading={loading} 
          bordered
          pagination={{ pageSize: 10 }}
        />

        {/* MODAL THÊM MỚI */}
        <Modal 
          title={<div style={{ color: GOLD_COLOR, textTransform: 'uppercase', fontSize: '18px' }}>Tạo Nhu cầu Mới</div>} 
          open={isFormVisible} onCancel={() => setIsFormVisible(false)} footer={null} width={700} closeIcon={<span style={{ color: '#fff' }}>✖</span>}
        >
          <Form form={form} layout="vertical" onFinish={handleFinishForm}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="khachHangId" label={<span className="text-gray-300">Mã Khách Hàng</span>} rules={[{ required: true }]}><Input placeholder="VD: KH001" /></Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="loaiNC" label={<span className="text-gray-300">Hình thức</span>} rules={[{ required: true }]}>
                  <Select placeholder="-- Chọn hình thức --" dropdownStyle={{ backgroundColor: '#1f1f1f', color: '#fff' }}>
                    <Option value="Mua">Mua</Option>
                    <Option value="Thuê">Thuê</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="loaiBDS" label={<span className="text-gray-300">Phân loại BĐS</span>} rules={[{ required: true }]}>
                  <Select placeholder="-- Chọn loại BĐS --" dropdownStyle={{ backgroundColor: '#1f1f1f', color: '#fff' }}>
                    <Option value="Chung cư">Chung cư</Option>
                    <Option value="Nhà phố">Nhà phố</Option>
                    <Option value="Đất nền">Đất nền</Option>
                    <Option value="Biệt thự">Biệt thự</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="viTri" label={<span className="text-gray-300">Khu vực mong muốn</span>} rules={[{ required: true }]}><Input placeholder="Hà Nội, Cầu Giấy..." /></Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dienTichMin" label={<span className="text-gray-300">Diện tích tối thiểu (m²)</span>}><Input type="number" /></Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dienTichMax" label={<span className="text-gray-300">Diện tích tối đa (m²)</span>}><Input type="number" /></Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="ghiChu" label={<span className="text-gray-300">Ghi chú thêm</span>}><Input.TextArea rows={3} style={{ backgroundColor: '#141414', color: '#fff' }} /></Form.Item>
              </Col>
            </Row>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#333]">
              <Button onClick={() => setIsFormVisible(false)} style={{ color: 'white', borderColor: '#555' }}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ fontWeight: 'bold', color: '#000' }}>Lưu thông tin</Button>
            </div>
          </Form>
        </Modal>

        {/* MODAL CHI TIẾT NHU CẦU */}
        <Modal 
          title={<div style={{ color: GOLD_COLOR, textTransform: 'uppercase', fontSize: '18px' }}>Chi tiết nhu cầu</div>}
          open={isDetailVisible} onCancel={() => setIsDetailVisible(false)} footer={null} width={700} closeIcon={<span style={{ color: '#fff' }}>✖</span>}
        >
          {detailData && (
            <div className="mt-4">
              <Descriptions bordered column={2} size="middle">
                <Descriptions.Item label="Mã Phiếu NC" span={2}><Text style={{ color: GOLD_COLOR, fontWeight: 'bold', fontSize: '16px' }}>{detailData.id}</Text></Descriptions.Item>
                <Descriptions.Item label="Mã Khách Hàng"><Text className="text-white">{detailData.khachHangId}</Text></Descriptions.Item>
                <Descriptions.Item label="Hình thức"><Text style={{ color: GOLD_COLOR }}>{detailData.loaiNC}</Text></Descriptions.Item>
                <Descriptions.Item label="Loại BĐS">{detailData.loaiBDS}</Descriptions.Item>
                <Descriptions.Item label="Diện tích">{detailData.dienTichMin || 0} - {detailData.dienTichMax || '∞'} m²</Descriptions.Item>
                <Descriptions.Item label="Khu vực" span={2}>{detailData.viTri}</Descriptions.Item>
                <Descriptions.Item label="Yêu cầu thêm" span={2}><div className="text-gray-300 italic">{detailData.ghiChu || 'Không có ghi chú thêm.'}</div></Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>

        {/* MODAL GỢI Ý BẤT ĐỘNG SẢN (TASK SE2108d) */}
        <Modal
          title={
            <div>
              <div style={{ color: '#52c41a', textTransform: 'uppercase', fontSize: '18px', fontWeight: 'bold' }}>
                <ThunderboltOutlined className="mr-2" /> Gợi ý Bất động sản phù hợp
              </div>
              {currentNhuCau && (
                <div style={{ fontSize: '14px', color: '#aaa', marginTop: '4px', textTransform: 'none', fontWeight: 'normal' }}>
                  Đang lọc cho Mã NC: <strong style={{ color: '#fff' }}>{currentNhuCau.id}</strong> | Loại: <strong style={{ color: '#fff' }}>{currentNhuCau.loaiBDS} ({currentNhuCau.loaiNC})</strong>
                </div>
              )}
            </div>
          }
          open={isSuggestModalVisible}
          onCancel={() => setIsSuggestModalVisible(false)}
          footer={null}
          width={850}
          closeIcon={<span style={{ color: '#fff' }}>✖</span>}
        >
          <div className="mt-4">
            {suggestList.length > 0 ? (
              <Table 
                columns={suggestColumns} 
                dataSource={suggestList} 
                rowKey="id" 
                loading={loadingSuggest}
                pagination={{ pageSize: 5 }}
                bordered
              />
            ) : (
              <div className="text-center py-10">
                <Text style={{ color: '#ff4d4f', fontSize: '16px' }}>Hiện tại không có Bất động sản nào trong kho đáp ứng được nhu cầu này.</Text>
              </div>
            )}
          </div>
        </Modal>

      </div>
    </ConfigProvider>
  );
}