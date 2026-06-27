import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { http } from '../../api/http'; 
import { toast } from 'react-toastify'; // 💡 Import thêm pop-up

export function AdminProfilePage() {
  const { user } = useAuth();
  
  // State để chuyển Tab
  const [activeTab, setActiveTab] = useState<'thong-tin' | 'doi-mat-khau'>('thong-tin');

  // State cho Đổi mật khẩu
  const [matKhauCu, setMatKhauCu] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  
  // State thông báo
  const [message, setMessage] = useState({ type: '', text: '' });

  // Hàm xử lý đổi mật khẩu
  const handleDoiMatKhau = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (matKhauMoi !== xacNhanMatKhau) {
      setMessage({ type: 'danger', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    try {
      await http.post('/auth/change-password', {
        currentPassword: matKhauCu,
        newPassword: matKhauMoi,
      });
      
      // 1. Bắn thông báo UI & Pop-up
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      
      // 2. Tước quyền (Xóa Token)
      localStorage.removeItem('accessToken');

      // 3. Đợi 1.5 giây để người dùng đọc thông báo rồi F5 đá về Login
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);

    } catch (error: any) {
      const errorMsg = Array.isArray(error.response?.data?.message) 
        ? error.response.data.message[0] 
        : error.response?.data?.message;
        
      setMessage({ 
        type: 'danger', 
        text: errorMsg || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!' 
      });
    }
  };

  // BIẾN STYLE CHUNG ĐỂ ÉP MÀU CHỮ TRẮNG CHO INPUT
  const inputStyle = { color: '#fff', backgroundColor: 'transparent' };

  return (
    <div className="content-wrapper">
      <style>{`
        .form-control::placeholder {
          color: #aaa !important;
          opacity: 1;
        }
      `}</style>
      
      <div className="page-title">
        <h1>Hồ Sơ Cá Nhân</h1>
      </div>

      <div className="row">
        {/* Cột trái: Menu chuyển Tab & Avatar */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body text-center">
              <div 
                style={{
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: '#D4AF37',
                  fontSize: '3rem'
                }}
              >
                <i className="fas fa-user-circle"></i>
              </div>
              <h3 style={{ color: '#D4AF37', marginBottom: '0.5rem' }}>{user?.hoTen}</h3>
              <p className="text-muted mb-4">{user?.chucVu || 'Nhân viên'} - {user?.maNV}</p>

              <div className="d-flex flex-column gap-2">
                <button 
                  className={`btn ${activeTab === 'thong-tin' ? 'btn-primary' : 'btn-secondary'} w-100`}
                  onClick={() => setActiveTab('thong-tin')}
                >
                  <i className="fas fa-id-card"></i> Thông tin cá nhân
                </button>
                <button 
                  className={`btn ${activeTab === 'doi-mat-khau' ? 'btn-primary' : 'btn-secondary'} w-100`}
                  onClick={() => setActiveTab('doi-mat-khau')}
                >
                  <i className="fas fa-key"></i> Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Nội dung chi tiết */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                {activeTab === 'thong-tin' ? 'Thông Tin Chi Tiết' : 'Cập Nhật Mật Khẩu'}
              </h3>
            </div>
            <div className="card-body">
              
              {/* Hiển thị thông báo */}
              {message.text && (
                <div className={`alert alert-${message.type} mb-4`}>
                  {message.text}
                </div>
              )}

              {/* TAB 1: THÔNG TIN CÁ NHÂN */}
              {activeTab === 'thong-tin' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input type="text" className="form-control" value={user?.hoTen || ''} disabled style={inputStyle} />
                  </div>
                  <div className="form-group">
                    <label>Mã Nhân Viên</label>
                    <input type="text" className="form-control" value={user?.maNV || ''} disabled style={inputStyle} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-control" value={user?.email || 'Chưa cập nhật'} disabled style={inputStyle} />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input type="text" className="form-control" value={user?.soDienThoai || 'Chưa cập nhật'} disabled style={inputStyle} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Chức vụ / Quyền hạn</label>
                    <input type="text" className="form-control" value={user?.role === '1' || user?.role?.toLowerCase() === 'admin' ? 'Quản trị viên (Admin)' : 'Nhân viên kinh doanh'} disabled style={inputStyle} />
                  </div>
                </div>
              )}

              {/* TAB 2: ĐỔI MẬT KHẨU */}
              {activeTab === 'doi-mat-khau' && (
                <form onSubmit={handleDoiMatKhau}>
                  <div className="form-group mb-4">
                    <label>Mật khẩu hiện tại</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Nhập mật khẩu đang dùng"
                      value={matKhauCu}
                      onChange={(e) => setMatKhauCu(e.target.value)}
                      required 
                      style={inputStyle}
                    />
                  </div>
                  <div className="form-group mb-4">
                    <label>Mật khẩu mới</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Nhập mật khẩu mới"
                      value={matKhauMoi}
                      onChange={(e) => setMatKhauMoi(e.target.value)}
                      required 
                      style={inputStyle}
                    />
                  </div>
                  <div className="form-group mb-4">
                    <label>Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Nhập lại mật khẩu mới"
                      value={xacNhanMatKhau}
                      onChange={(e) => setXacNhanMatKhau(e.target.value)}
                      required 
                      style={inputStyle}
                    />
                  </div>
                  <div className="form-actions mt-4">
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save"></i> Lưu Thay Đổi
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}