import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, message, Space, Tag, Typography, ConfigProvider, theme, Descriptions } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { http } from '../../api/http';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

export function EmployeeGiaoDichPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [giaoDichList, setGiaoDichList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

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

  const handleOpenDetail = (record: any) => {
    setDetailData(record);
    setIsDetailVisible(true);
  };

  // ĐÃ SỬA: Bỏ ép màu chữ đen, trả về đúng chuẩn màu như bên Admin
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
    { title: 'MÃ BĐS', dataIndex: 'batDongSanId', key: 'batDongSanId', render: (t: any) => <span className="text-gray-300">{t}</span> },
    { title: 'SỐ TIỀN', dataIndex: 'soTien', key: 'soTien', render: (v: any) => <Text style={{ color: GOLD_COLOR }} strong>{Number(v).toLocaleString('vi-VN')} đ</Text> },
    { title: 'NGÀY GD', dataIndex: 'ngayGD', key: 'ngayGD', render: (v: any) => <span className="text-gray-300">{dayjs(v).format('DD/MM/YYYY')}</span> },
    { title: 'TRẠNG THÁI', dataIndex: 'tinhTrang', key: 'tinhTrang', render: (v: string) => renderStatusTag(v) },
    {
      title: 'HÀNH ĐỘNG',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          {/* Nhân viên chỉ có quyền XEM chi tiết */}
          <Button type="primary" ghost style={{ borderColor: GOLD_COLOR, color: GOLD_COLOR }} icon={<EyeOutlined />} onClick={() => handleOpenDetail(record)}>
            Chi tiết
          </Button>
        </Space>
      ),
    },
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
      {contextHolder}
      <div className="p-6 bg-[#141414] min-h-[85vh] text-white">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-4">
          <Title level={3} style={{ margin: 0, color: GOLD_COLOR, textTransform: 'uppercase' }}>
            Tra cứu Giao dịch
          </Title>
          <Space size="middle">
            <Input 
              placeholder="Tìm kiếm mã GD, BĐS..." 
              prefix={<SearchOutlined style={{ color: GOLD_COLOR }} />} 
              style={{ width: '250px', backgroundColor: '#1f1f1f', borderColor: '#333', color: 'white' }}
              allowClear
              onChange={(e) => setSearchText(e.target.value)} 
            />
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
                    <div>Tổng giá trị: <strong style={{ color: GOLD_COLOR }}>{Number(detailData.soTien).toLocaleString('vi-VN')} đ</strong></div>
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