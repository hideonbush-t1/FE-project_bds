import { useState } from 'react';
import { Link } from 'react-router-dom';

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        /* Reset cơ bản cho header */
        .public-header { 
          display: flex; align-items: center; justify-content: space-between; 
          padding: 15px 30px; background: #1a1a2e; color: #fff; position: relative; z-index: 1000;
        }
        
        .header-top { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        
        .logo { font-size: 22px; font-weight: bold; color: #D4AF37; }
        
        .menu-wrapper { display: flex; align-items: center; gap: 20px; }
        .nav-main { display: flex; gap: 15px; }
        .nav-main a { color: #fff; text-decoration: none; }
        
        .nav-actions { display: flex; gap: 10px; align-items: center; }
        .btn-gold { background: #D4AF37; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; color: #000; font-weight: bold; }

        .menu-toggle { display: none; background: #333; color: #fff; border: none; padding: 5px 10px; font-size: 20px; cursor: pointer; }

        /* Mobile */
        @media (max-width: 768px) {
          .header-top { width: 100%; }
          .menu-toggle { display: block; }
          
          .menu-wrapper {
            display: ${menuOpen ? 'flex' : 'none'};
            flex-direction: column;
            position: absolute;
            top: 60px;
            left: 0;
            width: 100%;
            background: #1a1a2e;
            padding: 20px;
            border-top: 1px solid #333;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          }
          .nav-main, .nav-actions { flex-direction: column; gap: 15px; width: 100%; }
        }
      `}</style>

      <header className="public-header">
        <div className="header-top">
           <div className="logo">Batdongsan.com.vn</div>
           <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>

        <div className={`menu-wrapper ${menuOpen ? 'show' : ''}`}>
          <nav className="nav-main">
            <Link to="/" onClick={() => setMenuOpen(false)}>Nhà đất bán</Link>
            <Link to="/" onClick={() => setMenuOpen(false)}>Nhà đất thuê</Link>
            <Link to="/" onClick={() => setMenuOpen(false)}>Dự án</Link>
          </nav>
          
          <div className="nav-actions">
             <Link to="/login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
             <Link to="/register" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
             <button className="btn-gold">+ Đăng Tin</button>
          </div>
        </div>
      </header>
    </>
  );
}