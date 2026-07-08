import React from 'react';
import { Link } from 'react-router-dom';

export function SupportPage() {
  const supportItems = [
    "Hướng dẫn sử dụng tài khoản",
    "Hướng dẫn lập hợp đồng",
    "Hướng dẫn đổi mật khẩu",
    "Hướng dẫn giao dịch với khách hàng"
  ];

  return (
    <main className="public-page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', minHeight: '60vh' }}>
      <h1 style={{ color: '#D4AF37', textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '3rem' }}>
        HƯỚNG DẪN VÀ GIẢI THÍCH
      </h1>

      <div className="public-support-box" style={{ display: 'grid', gap: '1rem' }}>
        {supportItems.map((title, idx) => (
          <div key={idx} className="support-item" style={{ backgroundColor: 'transparent', border: '1px solid rgba(212, 175, 55, 0.5)', borderRadius: '8px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="support-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <i className="fas fa-file-alt support-icon" style={{ color: '#D4AF37', fontSize: '1.5rem' }}></i>
              <span className="support-title" style={{ fontSize: '1.1rem', color: '#fff' }}>{title}</span>
            </div>
            <div className="support-right">
              {/* Nút bấm tạm thời chưa có link, bạn có thể thay đổi sau */}
              <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#D4AF37', color: '#000', border: 'none', fontWeight: 'bold', padding: '8px 16px', borderRadius: '4px' }}>
                <i className="fas fa-hand-point-right" style={{ marginRight: '5px' }}></i> Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/" className="btn btn-secondary" style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none' }}>
          <i className="fas fa-arrow-left" style={{ marginRight: '5px' }}></i> Về Trang Chủ
        </Link>
      </div>
    </main>
  );
}