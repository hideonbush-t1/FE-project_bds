import React, { useState, useEffect } from 'react';
import { http } from '../../api/http';

export function HomePage() {
  const [danhSachBDS, setDanhSachBDS] = useState<any[]>([]);

  useEffect(() => {
    http.get('/public/bat-dong-san')
      .then((res) => {
        setDanhSachBDS(res.data.slice(0, 8));
      })
      .catch((err) => console.error('Lỗi lấy dữ liệu:', err));
  }, []);

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="hero-section">
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 className="hero-title">Các Dự Án Mới của Công Ty</h1>
        </div>
      </section>

      {/* ================= PROJECTS SECTION ================= */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div className="projects-grid">
          {danhSachBDS.map((project, index) => (
            <div className="project-card" key={project.id || index}>
              <div 
                className="project-image" 
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5D76E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111111', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center', padding: '1rem' }}
              >
                <i className="fas fa-building" style={{ marginRight: '0.5rem' }}></i> 
                {project.tieuDe || project.loaiBDS}
              </div>
              <div className="project-content">
                <h3 className="project-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.tieuDe || project.loaiBDS}</h3>
                <p className="project-info"><i className="fas fa-expand"></i> Diện tích: {project.dienTich} m²</p>
                <p className="project-info" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><i className="fas fa-map-marker-alt"></i> Vị trí: {project.diaChi}</p>
                <p className="project-info" style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '10px' }}><i className="fas fa-money-bill-wave"></i> {Number(project.giaTien).toLocaleString('vi-VN')} VNĐ</p>
                <div className="project-actions">
                  <button className="btn btn-primary"><i className="fas fa-eye"></i> Xem Chi Tiết</button>
                </div>
              </div>
            </div>
          ))}

          {danhSachBDS.length === 0 && (
            <div style={{ color: 'white', textAlign: 'center', gridColumn: '1 / -1' }}>Đang tải dữ liệu bất động sản...</div>
          )}
        </div>
      </main>
    </>
  );
}