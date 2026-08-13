import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function PublicLayout() {
  const { login } = useAuth();
  
  const [maNV, setMaNV] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState('');

  const handlePublicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(maNV, matKhau);
      const modalElement = document.getElementById('loginModal');
      if (modalElement && (window as any).bootstrap) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu!');
    }
  };

  return (
    <div className="public-layout-wrapper">
      {/* ================= PUBLIC HEADER DÙNG CHUNG ================= */}
      <header className="public-header" style={{ display: 'block' }}>
        <div className="public-header-main">
          <div className="public-logo-section">
            <Link to="/" className="public-logo">
              <strong>Batdongsan.com.vn</strong>
              <span className="public-logo-subtitle">Website số 1 về bất động sản</span>
            </Link>
          </div>

          <nav className="public-nav-main">
            <Link to="/">Nhà đất bán</Link>
            <Link to="/">Nhà đất thuê</Link>
            <Link to="/">Dự án</Link>
            <Link to="/">Cần mua - Cần thuê</Link>
          </nav>

          <div className="public-nav-right">
            <a href="#" className="nav-icon" title="Yêu thích"><i className="fas fa-heart"></i></a>
            <a href="#" data-bs-toggle="modal" data-bs-target="#loginModal" className="nav-link">Đăng Nhập</a>
            <a href="#" data-bs-toggle="modal" data-bs-target="#registerModal" className="nav-link">Đăng Ký</a>
            <button className="btn-post-property" data-bs-toggle="modal" data-bs-target="#loginModal">
              <i className="fas fa-plus"></i> Đăng Tin
            </button>
          </div>
        </div>

        {/* THANH MENU PHỤ */}
        <div className="public-nav-secondary">
          <Link to="/" className="nav-secondary-link">Trang chủ</Link>
          <Link to="/thong-bao" className="nav-secondary-link"><i className="fas fa-bell"></i> Thông báo</Link>
          <Link to="/lich-lam-viec" className="nav-secondary-link"><i className="fas fa-calendar"></i> Lịch làm việc</Link>
          <Link to="/ho-tro" className="nav-secondary-link"><i className="fas fa-headset"></i> Hỗ trợ</Link>
        </div>
      </header>

      {/* ================= OUTLET LÀ NƠI NHÉT CÁC TRANG CON VÀO ================= */}
      <div className="public-main-content">
        <Outlet />
      </div>

      {/* ================= FOOTER DÙNG CHUNG ================= */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-col">
            <h3 className="footer-logo">Batdongsan</h3>
            <p className="footer-desc">Website số 1 về bất động sản</p>
            <p className="footer-company">Công ty Cổ phần PropertyGuru Việt Nam</p>
            <p className="footer-text"><strong>Địa chỉ:</strong> Tầng 31, Keangnam Landmark, Phạm Hùng, Hà Nội</p>
            <p className="footer-text"><strong>Hotline:</strong> 1900 1881</p>
            <p className="footer-text"><strong>Email:</strong> contact@batdongsan.com.vn</p>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Hướng Dẫn</h4>
            <ul className="footer-links">
              <li><Link to="/">Báo giá & hỗ trợ</Link></li>
              <li><Link to="/">Câu hỏi thường gặp</Link></li>
              <li><Link to="/thong-bao">Thông báo</Link></li>
              <li><Link to="/">Liên hệ</Link></li>
              <li><Link to="/">Sitemap</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Quy Định</h4>
            <ul className="footer-links">
              <li><Link to="/">Quy định đăng tin</Link></li>
              <li><Link to="/">Quy chế hoạt động</Link></li>
              <li><Link to="/">Điều khoản thỏa thuận</Link></li>
              <li><Link to="/">Chính sách bảo mật</Link></li>
              <li><Link to="/">Giải quyết khiếu nại</Link></li>
              <li><Link to="/">Góp ý báo lỗi</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Đăng Ký Nhận Tin</h4>
            <div className="footer-subscribe">
              <input type="email" className="form-control" placeholder="Nhập email của bạn" />
              <button className="btn btn-primary"><i className="fas fa-paper-plane"></i> Gửi</button>
            </div>
            <div className="footer-language mt-3">
              <label htmlFor="language" className="d-block mb-2" style={{ color: '#D4AF37' }}>Quốc gia & Ngôn ngữ</label>
              <select id="language" className="form-control" style={{ backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #333' }}>
                <option value="vi">Việt Nam</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Batdongsan Center. All rights reserved.</p>
        </div>
      </footer>

      {/* ================= CÁC POPUP MODAL DÙNG CHUNG ================= */}
      <div className="modal fade" id="loginModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
          <div className="modal-content login-modal-content" style={{ borderRadius: '12px', border: '1px solid #D4AF37', backgroundColor: '#111' }}>
            <div className="modal-header login-modal-header" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', padding: '1rem 1.5rem' }}>
              <h5 className="modal-title" style={{ color: '#D4AF37', fontWeight: 'bold' }}><i className="fas fa-lock"></i> Đăng Nhập</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body login-modal-body" style={{ padding: '1.5rem' }}>
              <form onSubmit={handlePublicLogin}>
                {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.9rem' }}>{error}</div>}
                <div className="form-group mb-3">
                  <label className="mb-2" style={{ color: '#D4AF37', fontSize: '0.9rem' }}><i className="fas fa-user"></i> Tên Đăng Nhập</label>
                  <input type="text" className="form-control" value={maNV} onChange={(e) => setMaNV(e.target.value)} required style={{ backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #333' }} />
                </div>
                <div className="form-group mb-4">
                  <label className="mb-2" style={{ color: '#D4AF37', fontSize: '0.9rem' }}><i className="fas fa-lock"></i> Mật Khẩu</label>
                  <input type="password" className="form-control" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} required style={{ backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #333' }} />
                </div>
                <button type="submit" className="btn btn-primary w-100" style={{ backgroundColor: '#D4AF37', color: '#000', fontWeight: 'bold', border: 'none', padding: '12px', borderRadius: '6px' }}>
                  <i className="fas fa-sign-in-alt"></i> Đăng Nhập
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="registerModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '600px' }}>
          <div className="modal-content" style={{ borderRadius: '12px', border: '1px solid #D4AF37', backgroundColor: '#111' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', padding: '1rem 1.5rem' }}>
              <h5 className="modal-title" style={{ color: '#D4AF37', fontWeight: 'bold' }}><i className="fas fa-user-plus"></i> Đăng Ký</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <form onSubmit={(e) => { e.preventDefault(); alert('Chức năng gửi đăng ký đang phát triển!'); }}>
                <div className="row">
                  <div className="col-md-6 mb-3"><label className="mb-2" style={{ color: '#D4AF37' }}>Họ tên</label><input type="text" className="form-control" required style={{ backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #333' }} /></div>
                  <div className="col-md-6 mb-3"><label className="mb-2" style={{ color: '#D4AF37' }}>Email</label><input type="email" className="form-control" required style={{ backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #333' }} /></div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-4"><label className="mb-2" style={{ color: '#D4AF37' }}>Số điện thoại</label><input type="tel" className="form-control" required style={{ backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #333' }} /></div>
                  <div className="col-md-6 mb-4"><label className="mb-2" style={{ color: '#D4AF37' }}>Địa chỉ</label><input type="text" className="form-control" required style={{ backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #333' }} /></div>
                </div>
                <button type="submit" className="btn btn-primary w-100" style={{ backgroundColor: '#D4AF37', color: '#000', fontWeight: 'bold' }}>Gửi đăng ký</button>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}