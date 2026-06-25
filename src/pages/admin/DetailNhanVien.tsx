import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; 

export const DetailNhanVien = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nhanVien, setNhanVien] = useState<any>(null);
  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    fetch(`http://localhost:4000/nhan-vien/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        const nv = data.data || data; 
        setNhanVien(nv);
      })
      .catch(() => toast.error('Lỗi khi tải thông tin nhân viên!'));
  }, [id, token]);

  if (!nhanVien) {
    return <div style={{ color: '#f1c40f', textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>Đang tải dữ liệu hồ sơ...</div>;
  }

  // Kiểm tra xem là Admin hay Nhân viên để hiển thị màu/icon cho đẹp
  const isAdmin = String(nhanVien.Role || nhanVien.role).toLowerCase() === 'admin';

  return (
    <div className="bds-container">
      <ToastContainer position="top-right" autoClose={2000} />
      
      <div className="bds-detail-card" style={{ maxWidth: '750px', margin: '0 auto' }}>
        
        {/* ================= HEADER ================= */}
        <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #4a4e69', paddingBottom: '16px', marginBottom: '24px' }}>
          <h2 style={{ color: '#f1c40f', margin: 0 }}>Hồ Sơ Nhân Viên</h2>
          <button 
            className="btn-back" 
            onClick={() => navigate('/admin/nhan-vien')}
            style={{ padding: '8px 16px', backgroundColor: '#4a4e69', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
        </div>

        {/* ================= AVATAR & THÔNG TIN CƠ BẢN ================= */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '12px', border: '1px solid #4a4e69' }}>
          <div style={{ 
            width: '85px', height: '85px', borderRadius: '50%', 
            backgroundColor: isAdmin ? 'rgba(231, 76, 60, 0.15)' : 'rgba(46, 204, 113, 0.15)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: isAdmin ? '#e74c3c' : '#2ecc71', fontSize: '2.5rem',
            border: `2px solid ${isAdmin ? '#e74c3c' : '#2ecc71'}`
          }}>
            <i className={isAdmin ? "fas fa-user-shield" : "fas fa-user-tie"}></i>
          </div>
          
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.6rem' }}>{nhanVien.hoTen}</h3>
            <p style={{ margin: '0 0 12px 0', color: '#bdc3c7', fontSize: '1.05rem' }}>
              {nhanVien.chucVu} - <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>{nhanVien.id || nhanVien.maNV}</span>
            </p>
            <span className={`status ${isAdmin ? 'sold' : 'available'}`} style={{ padding: '6px 16px' }}>
              {isAdmin ? 'Quản trị viên hệ thống' : 'Nhân viên (Employee)'}
            </span>
          </div>
        </div>

        {/* ================= CHI TIẾT LIÊN HỆ ================= */}
        <div className="detail-grid" style={{ gap: '16px' }}>
          <div className="detail-item" style={{ backgroundColor: '#1a1a2e', border: '1px solid #4a4e69' }}>
            <div style={{ color: '#bdc3c7', fontSize: '0.9rem', marginBottom: '6px' }}>
              <i className="fas fa-envelope" style={{ marginRight: '8px', color: '#3498db' }}></i> Địa chỉ Email
            </div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{nhanVien.email || 'Chưa cập nhật'}</div>
          </div>

          <div className="detail-item" style={{ backgroundColor: '#1a1a2e', border: '1px solid #4a4e69' }}>
            <div style={{ color: '#bdc3c7', fontSize: '0.9rem', marginBottom: '6px' }}>
              <i className="fas fa-phone-alt" style={{ marginRight: '8px', color: '#2ecc71' }}></i> Số điện thoại
            </div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{nhanVien.soDienThoai || 'Chưa cập nhật'}</div>
          </div>

          <div className="detail-item" style={{ backgroundColor: '#1a1a2e', border: '1px solid #4a4e69' }}>
            <div style={{ color: '#bdc3c7', fontSize: '0.9rem', marginBottom: '6px' }}>
              <i className="fas fa-briefcase" style={{ marginRight: '8px', color: '#9b59b6' }}></i> Phòng ban / Chức vụ
            </div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{nhanVien.chucVu}</div>
          </div>

          <div className="detail-item" style={{ backgroundColor: '#1a1a2e', border: '1px solid #4a4e69' }}>
            <div style={{ color: '#bdc3c7', fontSize: '0.9rem', marginBottom: '6px' }}>
              <i className="fas fa-calendar-check" style={{ marginRight: '8px', color: '#f1c40f' }}></i> Ngày gia nhập
            </div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>
              {nhanVien.ngayTao ? new Date(nhanVien.ngayTao).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Không xác định'}
            </div>
          </div>
        </div>

        {/* ================= NÚT CHỈNH SỬA ================= */}
        <div className="form-actions" style={{ marginTop: '30px', borderTop: '1px solid #4a4e69', paddingTop: '24px', justifyContent: 'center' }}>
          <button 
            type="button" 
            className="btn-edit" 
            onClick={() => navigate(`/admin/nhan-vien/edit/${nhanVien.id}`)}
            style={{ padding: '12px 32px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
          >
            <i className="fas fa-edit"></i> Cập nhật hồ sơ
          </button>
        </div>

      </div>
    </div>
  );
};