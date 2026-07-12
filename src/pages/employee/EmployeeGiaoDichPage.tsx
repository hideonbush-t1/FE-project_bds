import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Select, Input, DatePicker, Row, Col, ConfigProvider, theme, Button } from 'antd';
import { UserOutlined, HomeOutlined, DollarOutlined } from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; // Dùng chung CSS
import { http } from '../../api/http';
import dayjs from 'dayjs';

export function EmployeeGiaoDichPage() {
  const navigate = useNavigate();

  const [giaoDichList, setGiaoDichList] = useState<any[]>([]);
  const [khachHangList, setKhachHangList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // State Modal Form & Detail
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [form] = Form.useForm();
  
  const GOLD_COLOR = '#D4AF37';

  const currentNhanVien = useMemo(() => {
    try {
      const userRaw = localStorage.getItem('user') || localStorage.getItem('userInfo');
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        return { id: userObj?.maNV || userObj?.id || 'NV001', name: userObj?.hoTen || 'Nhân viên 1' };
      }
    } catch (e) {}
    return { id: 'NV001', name: 'Nhân viên 1' };
  }, []);

  const fetchData = async () => {
    try {
      const [resGD, resKH] = await Promise.all([http.get('/giao-dich'), http.get('/khach-hang')]);
      setGiaoDichList(resGD.data); 
      setKhachHangList(resKH.data);
    } catch (error) { toast.error('Lỗi tải dữ liệu!'); }
  };

  useEffect(() => { fetchData(); }, []);

  const getKhachHangName = (id: string) => { 
    const kh = khachHangList.find(k => k.id === id); 
    return kh ? `${kh.hoTen} (${id})` : id; 
  };
  
  const khachHangOptions = useMemo(() => 
    khachHangList.map(kh => ({ label: `${kh.hoTen} (${kh.id})`, value: kh.id })), 
  [khachHangList]);

  const handleOpenAdd = () => {
    form.resetFields();
    form.setFieldsValue({ nhanVienId: currentNhanVien.id, nhanVienHienThi: `${currentNhanVien.name} (${currentNhanVien.id})` });
    setIsFormVisible(true);
  };

  const handleFinishForm = async (values: any) => {
    try {
      const payload: any = {
        nhanVienId: currentNhanVien.id,
        batDongSanId: values.batDongSanId,
        benMuaId: values.benMuaId,
        benBanId: values.benBanId || null,
        soTien: String(values.soTien),
        tyLeHoaHong: values.tyLeHoaHong ? Number(values.tyLeHoaHong) : 0,
        ngayGD: values.ngayGD ? values.ngayGD.toISOString() : new Date().toISOString(),
        tinhTrang: 'Đang xử lý',
        moTaGD: values.moTaGD || null,
      };

      await http.post('/giao-dich', payload);
      toast.success('Đã gửi thông tin giao dịch chờ duyệt!');
      
      try {
        await http.patch(`/bat-dong-san/${values.batDongSanId}`, { tinhTrang: 'Đang giao dịch' });
      } catch (e) {}

      setIsFormVisible(false); 
      fetchData();
    } catch (error) { toast.error('Lỗi lưu dữ liệu!'); }
  };

  // Lọc và Phân trang
  const filteredList = giaoDichList.filter((gd) => {
    if (!searchText) return true;
    const lowerSearch = searchText.toLowerCase();
    return (gd.id?.toLowerCase().includes(lowerSearch) || gd.batDongSanId?.toLowerCase().includes(lowerSearch));
  });

  const currentItems = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: GOLD_COLOR, colorBgBase: '#1a1a2e', colorBgContainer: '#16213e', colorTextBase: '#ffffff' } }}>
      <div className="bds-container">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        
        {/* HEADER ĐỒNG BỘ */}
        <div className="bds-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h2>Danh sách Giao dịch (Sale)</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input 
              type="text" placeholder="Tìm Mã GD, Mã BĐS..." value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
              style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #4a4e69', backgroundColor: '#1a1a2e', color: '#fff', width: '250px', outline: 'none' }}
            />
            <button className="btn-add" onClick={handleOpenAdd}>+ Tạo Giao dịch</button>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="bds-table-wrapper">
          <table className="bds-table">
            <thead>
              <tr>
                <th>Mã GD</th>
                <th>Bên Mua</th>
                <th>Mã BĐS</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th className="actions">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((gd: any) => (
                <tr key={gd.id}>
                  <td style={{ fontWeight: 'bold' }}>{gd.id}</td>
                  <td>{getKhachHangName(gd.benMua)}</td>
                  <td style={{ color: GOLD_COLOR, fontWeight: 'bold' }}>{gd.batDongSanId}</td>
                  <td style={{ fontWeight: 'bold' }}>{Number(gd.soTien).toLocaleString('vi-VN')} đ</td>
                  <td>
                    <span className="status" style={{ backgroundColor: gd.tinhTrang === 'Thành công' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(52, 152, 219, 0.2)', color: gd.tinhTrang === 'Thành công' ? '#2ecc71' : '#3498db' }}>
                      {gd.tinhTrang}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-view" onClick={() => { setDetailData(gd); setIsDetailVisible(true); }}>Xem</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL FORM & DETAIL (Giữ nguyên Ant Design) */}
        <Modal title="TẠO GIAO DỊCH MỚI" open={isFormVisible} onCancel={() => setIsFormVisible(false)} footer={null} width={800}>
          <Form form={form} layout="vertical" onFinish={handleFinishForm}>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="nhanVienHienThi" label="Nhân viên chốt"><Input disabled /></Form.Item></Col>
              <Col span={12}><Form.Item name="batDongSanId" label="Mã BĐS" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="benMuaId" label="Bên Mua" rules={[{ required: true }]}><Select showSearch options={khachHangOptions} /></Form.Item></Col>
              <Col span={12}><Form.Item name="benBanId" label="Bên Bán"><Select showSearch allowClear options={khachHangOptions} /></Form.Item></Col>
              <Col span={8}><Form.Item name="soTien" label="Số tiền" rules={[{ required: true }]}><Input type="number" /></Form.Item></Col>
              <Col span={8}><Form.Item name="tyLeHoaHong" label="Hoa hồng (%)"><Input type="number" /></Form.Item></Col>
              <Col span={8}><Form.Item name="ngayGD" label="Ngày GD" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => setIsFormVisible(false)} style={{ marginRight: 10 }}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: GOLD_COLOR }}>Lưu</Button>
            </div>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
}