import React, { useState, useEffect} from 'react';
import { http } from '../../api/http';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const [danhSachBDS, setDanhSachBDS] = useState<any[]>([]);
  const navigate = useNavigate();

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
      <main style={{ backgroundColor: '#111111', color: '#fff', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ color: '#D4AF37', marginBottom: '30px' }}>Dự án nổi bật</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
            {danhSachBDS.map((project) => (
              <div 
                key={project.id} 
                onClick={() => navigate(`/chi-tiet/${project.id}`)}
                style={{ background: '#1a1a1a', borderRadius: '10px', border: '1px solid #333', cursor: 'pointer', transition: '0.3s' }}
              >
                <img src={project.hinhAnhs?.[0]?.duongDan} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px 10px 0 0' }} />
                <div style={{ padding: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>{project.tieuDe}</h4>
                  <p style={{ color: '#D4AF37', fontWeight: 'bold' }}>{Number(project.giaTien).toLocaleString('vi-VN')} VNĐ</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}