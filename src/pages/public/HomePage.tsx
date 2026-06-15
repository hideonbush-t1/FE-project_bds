import { PublicDataPanel } from '../../components/pages/PublicDataPanel';

export function HomePage() {
  return (
    <div className="hero">
      <div className="hero-grid">
        <section className="hero-copy">
          <span className="hero-badge">Realtime data từ NestJS</span>
          <h1>Trung tâm môi giới bất động sản</h1>
          <p className="muted mb-0">
            Quản lý nhân viên, khách hàng, bất động sản, giao dịch, thông báo và biểu mẫu trên một nền tảng.
          </p>
        </section>
        <aside className="panel">
          <div className="metric-card mb-3">
            <div className="muted">Luồng đăng nhập</div>
            <div className="metric-value">JWT + Role Guard</div>
          </div>
          <div className="metric-card mb-3">
            <div className="muted">Frontend</div>
            <div className="metric-value">React + Vite</div>
          </div>
          <div className="metric-card">
            <div className="muted">Backend</div>
            <div className="metric-value">NestJS + Prisma</div>
          </div>
        </aside>
      </div>

      <div className="section-grid">
        <div className="metric-card">
          <div className="muted">Đăng nhập</div>
          <div className="metric-value">Modal</div>
        </div>
        <div className="metric-card">
          <div className="muted">Dữ liệu public</div>
          <div className="metric-value">API thật</div>
        </div>
        <div className="metric-card">
          <div className="muted">Trang quản trị</div>
          <div className="metric-value">Role-based</div>
        </div>
      </div>

      <PublicDataPanel title="Bất động sản nổi bật" endpoint="/public/bat-dong-san" />
      <PublicDataPanel title="Thông báo mới" endpoint="/public/thong-bao" />
    </div>
  );
}