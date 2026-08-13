import React, { useState, useEffect } from 'react';
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

  // --- STATE CHO CHỈNH SỬA THÔNG TIN ---
  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  const GOLD_COLOR = '#D4AF37';

  // Đổ dữ liệu có sẵn vào ô input khi load trang
  useEffect(() => {
    if (user) {
      setEditEmail(user.email || '');
      setEditPhone(user.soDienThoai || '');
    }
  }, [user]);

  // Hàm xử lý lưu thông tin
  const handleSaveInfo = async () => {
    setIsSavingInfo(true);
    try {
      await http.patch(`/nhan-vien/${user?.id || user?.maNV}`, {
        email: editEmail,
        soDienThoai: editPhone,
      });
      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
      setTimeout(() => { window.location.reload(); }, 1000); 
    } catch (error) {
      toast.error('Lỗi khi cập nhật thông tin!');
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Hàm xử lý Đổi Mật Khẩu (Đã bổ sung Validation chặt chẽ)
  const handleDoiMatKhau = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Kiểm tra rỗng
    if (!matKhauCu || !matKhauMoi || !xacNhanMatKhau) {
      toast.error('Vui lòng không được để trống thông tin!');
      return;
    }

    // 2. Kiểm tra độ dài
    if (matKhauMoi.length < 6) {
      toast.warning('Mật khẩu mới không được dưới 6 ký tự!');
      return;
    }

    // 3. Kiểm tra trùng mật khẩu cũ
    if (matKhauCu === matKhauMoi) {
      toast.warning('Mật khẩu mới phải khác mật khẩu hiện tại!');
      return;
    }

    // 4. Kiểm tra xác nhận mật khẩu
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
      
      // Reset form
      setMatKhauCu(''); setMatKhauMoi(''); setXacNhanMatKhau('');
      localStorage.removeItem('accessToken');

      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);

    } catch (error: any) {
      // 5. Bắt lỗi từ Backend trả về
      const errorMsg = Array.isArray(error.response?.data?.message) 
        ? error.response.data.message[0] 
        : error.response?.data?.message;
        
      toast.error(errorMsg || 'Mật khẩu hiện tại không chính xác!');
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
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  
                  {/* CÁC Ô BỊ KHÓA (LÀM MỜ CHỮ ĐỂ PHÂN BIỆT) */}
                  <div>
                    <label style={labelStyle}>Họ và tên</label>
                    <input type="text" value={user?.hoTen || ''} disabled style={{...inputStyle, backgroundColor: '#13141f', cursor: 'not-allowed', color: '#7a7a8c'}} />
                  </div>
                  <div>
                    <label style={labelStyle}>Mã Nhân Viên</label>
                    <input type="text" value={user?.maNV || ''} disabled style={{...inputStyle, backgroundColor: '#13141f', cursor: 'not-allowed', color: '#7a7a8c'}} />
                  </div>

                  {/* CÁC Ô ĐƯỢC PHÉP SỬA (SẼ PHÁT SÁNG KHI isEditing = true) */}
                  <div>
                    <label style={labelStyle}>Email {isEditing && <span style={{color: GOLD_COLOR, fontSize: '12px', marginLeft: '5px'}}>(Có thể sửa)</span>}</label>
                    <input 
                      type="email" 
                      value={isEditing ? editEmail : (user?.email || 'Chưa cập nhật')} 
                      onChange={(e) => setEditEmail(e.target.value)}
                      disabled={!isEditing} 
                      style={{
                        ...inputStyle, 
                        backgroundColor: isEditing ? '#232b42' : '#13141f', 
                        cursor: isEditing ? 'text' : 'not-allowed', 
                        borderColor: isEditing ? GOLD_COLOR : '#4a4e69',
                        color: isEditing ? '#fff' : '#7a7a8c',
                        boxShadow: isEditing ? `0 0 8px ${GOLD_COLOR}60` : 'none',
                        transition: 'all 0.3s ease'
                      }} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Số điện thoại {isEditing && <span style={{color: GOLD_COLOR, fontSize: '12px', marginLeft: '5px'}}>(Có thể sửa)</span>}</label>
                    <input 
                      type="text" 
                      value={isEditing ? editPhone : (user?.soDienThoai || 'Chưa cập nhật')} 
                      onChange={(e) => setEditPhone(e.target.value)}
                      disabled={!isEditing} 
                      style={{
                        ...inputStyle, 
                        backgroundColor: isEditing ? '#232b42' : '#13141f', 
                        cursor: isEditing ? 'text' : 'not-allowed', 
                        borderColor: isEditing ? GOLD_COLOR : '#4a4e69',
                        color: isEditing ? '#fff' : '#7a7a8c',
                        boxShadow: isEditing ? `0 0 8px ${GOLD_COLOR}60` : 'none',
                        transition: 'all 0.3s ease'
                      }} 
                    />
                  </div>

                  {/* Ô CHỨC VỤ BỊ KHÓA */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Chức vụ / Quyền hạn</label>
                    <input type="text" value={user?.role === '1' || user?.role?.toLowerCase() === 'admin' ? 'Quản trị viên (Admin)' : 'Nhân viên kinh doanh'} disabled style={{...inputStyle, backgroundColor: '#13141f', cursor: 'not-allowed', color: '#7a7a8c', fontWeight: 'bold'}} />
                  </div>
                </div>

                {/* NÚT BẤM CHỈNH SỬA / LƯU CÓ HIỆU ỨNG HOVER */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px', gap: '15px' }}>
                  {isEditing ? (
                    <>
                      <button 
                        onClick={() => { setIsEditing(false); setEditEmail(user?.email || ''); setEditPhone(user?.soDienThoai || ''); }} 
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4a4e69'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #4a4e69', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
                      >
                        Hủy
                      </button>
                      <button 
                        onClick={handleSaveInfo} 
                        disabled={isSubmitting || isSavingInfo} 
                        onMouseEnter={(e) => { if(!isSavingInfo) e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: GOLD_COLOR, color: '#000', cursor: (isSubmitting || isSavingInfo) ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
                      >
                        {isSavingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = GOLD_COLOR; e.currentTarget.style.color = '#000'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = GOLD_COLOR; }}
                      style={{ padding: '10px 20px', borderRadius: '6px', border: `1px solid ${GOLD_COLOR}`, backgroundColor: 'transparent', color: GOLD_COLOR, cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
                    >
                      Chỉnh sửa thông tin
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ĐỔI MẬT KHẨU */}
            {activeTab === 'doi-mat-khau' && (
              <form onSubmit={handleDoiMatKhau} style={{ maxWidth: '500px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Mật khẩu hiện tại <span style={{color: '#ff4d4f'}}>*</span></label>
                  <input 
                    type="password" 
                    placeholder="Nhập mật khẩu đang dùng"
                    value={matKhauCu}
                    onChange={(e) => setMatKhauCu(e.target.value)}
                    required 
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Mật khẩu mới <span style={{color: '#ff4d4f'}}>*</span></label>
                  <input 
                    type="password" 
                    placeholder="Nhập mật khẩu mới"
                    value={matKhauMoi}
                    onChange={(e) => setMatKhauMoi(e.target.value)}
                    required 
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <label style={labelStyle}>Xác nhận mật khẩu mới <span style={{color: '#ff4d4f'}}>*</span></label>
                  <input 
                    type="password" 
                    placeholder="Nhập lại mật khẩu mới"
                    value={xacNhanMatKhau}
                    onChange={(e) => setXacNhanMatKhau(e.target.value)}
                    required 
                    style={inputStyle}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ 
                    padding: '12px 25px', borderRadius: '6px', border: 'none', backgroundColor: GOLD_COLOR, color: '#000', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
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