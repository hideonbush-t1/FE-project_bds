import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoginModal } from './LoginModal';

export function PublicHeader() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header className="public-header">
        <div className="public-brand">
          <Link to="/" className="brand-link">
            <span className="brand-mark">Batdongsan</span>
            <span className="brand-sub">Center Management</span>
          </Link>
        </div>
        <nav className="public-nav">
          <Link to="/notifications">Thông báo</Link>
          <Link to="/support">Hỗ trợ</Link>
          <Link to="/register">Đăng ký</Link>
        </nav>
        <div className="public-actions">
          <button className="btn btn-gold" onClick={() => setShowLogin(true)}>
            Đăng nhập
          </button>
        </div>
      </header>
      {showLogin ? <LoginModal onClose={() => setShowLogin(false)} /> : null}
    </>
  );
}