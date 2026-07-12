import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { http } from '../../api/http'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserOutlined, IdcardOutlined, KeyOutlined, SaveOutlined } from '@ant-design/icons';
import '../batdongsan/BatDongSan.css'; // Dùng chung CSS

export function EmployeeProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'thong-tin' | 'doi-mat-khau'>('thong-tin');

  const [matKhauCu, setMatKhauCu] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const GOLD_COLOR = '#D4AF37';

  const handleDoiMatKhau = async (e: React.FormEvent) => {
    e.preventDefault();
    if (matKhauMoi !== xacNhanMatKhau) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsSubmitting(true);
    try {
      await http.post('/auth/change-password', {
        currentPassword: matKhauCu,
        newPassword: matKhauMoi,
      });
      
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      localStorage.removeItem('accessToken');
      setTimeout(() => { window.location.href = '/login'; }, 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đổi mật khẩu thất bại!';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 15px', backgroundColor: '#16213e',
    border: '1px solid #4a4e69', borderRadius: '6px', color: '#fff',
    outline: 'none', fontSize: '15px'
  };

  const labelStyle = { display: 'block', marginBottom: '8px', color: '#aaa', fontWeight: 'bold', fontSize: '14px' };

  return (
    <div className="bds-container" style={{ minHeight: '85vh' }}>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <div className="bds-header" style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h2>Hồ Sơ Cá Nhân</h2>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* CỘT TRÁI */}
        <div style={{ flex: '1 1 300px', maxWidth: '350px' }}>
          <div style={{ backgroundColor: '#1a1a2e', padding: '40px 20px', borderRadius: '12px', border: '1px solid #333', textAlign: 'center' }}>
            <div style={{
                width: '120px', height: '120px', borderRadius: '50%', 
                backgroundColor: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', margin: '0 auto 20px', color: GOLD_COLOR, fontSize: '50px',
                border: `2px solid ${GOLD_COLOR}`
              }}>
              <UserOutlined />
            </div>
            
            <h3 style={{ color: GOLD_COLOR, margin: '0 0 10px 0', fontSize: '22px' }}>{user?.hoTen}</h3>
            <p style={{ color: '#8b8c9e', marginBottom: '30px', fontSize: '15px' }}>
              {user?.chucVu || 'Nhân viên'} - <span style={{ color: '#fff', fontWeight: 'bold' }}>{user?.maNV}</span>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button 
                onClick={() => setActiveTab('thong-tin')}
                style={{ 
                  padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  backgroundColor: activeTab === 'thong-tin' ? GOLD_COLOR : '#16213e', color: activeTab === 'thong-tin' ? '#000' : '#fff'
                }}
              >
                <IdcardOutlined /> Thông tin cá nhân
              </button>
              <button 
                onClick={() => setActiveTab('doi-mat-khau')}
                style={{ 
                  padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  backgroundColor: activeTab === 'doi-mat-khau' ? GOLD_COLOR : '#16213e', color: activeTab === 'doi-mat-khau' ? '#000' : '#fff'
                }}
              >
                <KeyOutlined /> Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div style={{ flex: '2 1 600px' }}>
          <div style={{ backgroundColor: '#1a1a2e', padding: '30px', borderRadius: '12px', border: '1px solid #333', minHeight: '100%' }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '30px', fontSize: '20px', borderBottom: '1px dashed #444', paddingBottom: '15px' }}>
              {activeTab === 'thong-tin' ? 'THÔNG TIN CHI TIẾT' : 'CẬP NHẬT MẬT KHẨU'}
            </h3>

            {activeTab === 'thong-tin' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Họ và tên</label>
                  <input type="text" value={user?.hoTen || ''} disabled style={{...inputStyle, backgroundColor: '#13141f', cursor: 'not-allowed'}} />
                </div>
                <div>
                  <label style={labelStyle}>Mã Nhân Viên</label>
                  <input type="text" value={user?.maNV || ''} disabled style={{...inputStyle, backgroundColor: '#13141f', cursor: 'not-allowed'}} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={user?.email || 'Chưa cập nhật'} disabled style={{...inputStyle, backgroundColor: '#13141f', cursor: 'not-allowed'}} />
                </div>
                <div>
                  <label style={labelStyle}>Số điện thoại</label>
                  <input type="text" value={user?.soDienThoai || 'Chưa cập nhật'} disabled style={{...inputStyle, backgroundColor: '#13141f', cursor: 'not-allowed'}} />
                </div>
              </div>
            )}

            {activeTab === 'doi-mat-khau' && (
              <form onSubmit={handleDoiMatKhau} style={{ maxWidth: '500px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Mật khẩu hiện tại</label>
                  <input type="password" value={matKhauCu} onChange={(e) => setMatKhauCu(e.target.value)} required style={inputStyle} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Mật khẩu mới</label>
                  <input type="password" value={matKhauMoi} onChange={(e) => setMatKhauMoi(e.target.value)} required style={inputStyle} />
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <label style={labelStyle}>Xác nhận mật khẩu mới</label>
                  <input type="password" value={xacNhanMatKhau} onChange={(e) => setXacNhanMatKhau(e.target.value)} required style={inputStyle} />
                </div>
                
                <button type="submit" disabled={isSubmitting} style={{ padding: '12px 25px', borderRadius: '6px', border: 'none', backgroundColor: GOLD_COLOR, color: '#000', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SaveOutlined /> {isSubmitting ? 'Đang xử lý...' : 'Lưu Thay Đổi'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}