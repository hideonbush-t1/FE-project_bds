import { http } from '../../api/http';
import { useFetch } from '../../hooks/useFetch';
import { formatMoney } from '../../utils/money';

export function PublicDataPanel({
  title,
  endpoint,
}: {
  title: string;
  endpoint: string;
}) {
  const { data, loading, error } = useFetch(async () => {
    const response = await http.get(endpoint);
    return response.data as Array<Record<string, unknown>>;
  }, [endpoint]);

  const isNotification = endpoint.includes('thong-bao');
  const isSchedule = endpoint.includes('lich-lam-viec');

  const renderContent = () => {
    if (loading) return <div style={{ color: '#D4AF37', textAlign: 'center', padding: '2rem' }}><i className="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</div>;
    if (error) return <div className="alert alert-danger" style={{ backgroundColor: '#220000', color: '#ff6b6b', border: '1px solid #ff0000' }}>{error}</div>;
    if (!data || data.length === 0) return <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Chưa có dữ liệu.</div>;

    // 1. GIAO DIỆN DÀNH CHO THÔNG BÁO (Bám sát thiết kế HTML gốc)
    if (isNotification) {
      return (
        // Khung viền vàng lớn bao trọn toàn bộ danh sách
        <div className="public-notifications-box" style={{ border: '1px solid #D4AF37', borderRadius: '8px', padding: '2rem 3rem', backgroundColor: 'transparent' }}>
          {data.map((item: any, idx: number) => (
            <div 
              key={item.id || idx} 
              className="notification-item" 
              style={{ 
                padding: '1.5rem 0', 
                // Kẻ vạch ngăn cách giữa các item (trừ item cuối cùng)
                borderBottom: idx !== data.length - 1 ? '1px solid rgba(212, 175, 55, 0.2)' : 'none' 
              }}
            >
              <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                {item.thoiGian || item.ngayTao || item.ngay || 'Thứ hai, ngày 22/02/2026'}
              </div>
              <h4 style={{ color: '#D4AF37', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {item.tieuDe || item.ten || 'Thông báo hệ thống'}
              </h4>
              <div style={{ color: '#fff', fontSize: '1rem', lineHeight: '1.6' }}>
                {item.noiDung || item.moTa || 'Nội dung thông báo đang được cập nhật...'}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 2. GIAO DIỆN DÀNH CHO LỊCH LÀM VIỆC (Bảng Table)
    if (isSchedule) {
      return (
        <div className="table-responsive" style={{ border: '1px solid #D4AF37', borderRadius: '8px', overflow: 'hidden' }}>
          <table className="table table-dark table-striped table-hover mb-0">
            <thead style={{ borderBottom: '2px solid #D4AF37' }}>
              <tr>
                <th style={{ color: '#D4AF37', padding: '1rem' }}>STT</th>
                <th style={{ color: '#D4AF37', padding: '1rem' }}>Ngày</th>
                <th style={{ color: '#D4AF37', padding: '1rem' }}>Ca Làm</th>
                <th style={{ color: '#D4AF37', padding: '1rem' }}>Bộ Phận</th>
                <th style={{ color: '#D4AF37', padding: '1rem' }}>Nhân Viên</th>
                <th style={{ color: '#D4AF37', padding: '1rem' }}>Ghi Chú</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: any, idx: number) => (
                <tr key={item.id || idx}>
                  <td style={{ padding: '1rem' }}>{idx + 1}</td>
                  <td style={{ padding: '1rem' }}>{item.ngay || item.ngayLamViec || '-'}</td>
                  <td style={{ padding: '1rem' }}>{item.caLam || item.ca || 'Hành chính'}</td>
                  <td style={{ padding: '1rem' }}>{item.boPhan || item.phongBan || 'Chung'}</td>
                  <td style={{ padding: '1rem' }}>{item.nhanVien || item.hoTen || item.nguoiPhuTrach || '-'}</td>
                  <td style={{ padding: '1rem' }}>{item.ghiChu || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 3. GIAO DIỆN MẶC ĐỊNH (Cho Hỗ trợ hoặc các Endpoint khác)
    return (
      <div className="row g-3">
        {data.slice(0, 10).map((item: any, idx: number) => (
          <div className="col-md-6" key={item.id || idx}>
            <div className="support-item" style={{ backgroundColor: 'transparent', border: '1px solid rgba(212, 175, 55, 0.5)', borderRadius: '8px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
              <div className="support-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <i className="fas fa-file-alt support-icon" style={{ color: '#D4AF37', fontSize: '1.5rem' }}></i>
                <div>
                  <span className="support-title" style={{ fontSize: '1.1rem', color: '#fff', display: 'block', marginBottom: '5px' }}>
                    {item.tieuDe || item.tenHoSo || item.hoTen || 'Mục dữ liệu'}
                  </span>
                  {item.giaTien && <span style={{ color: '#D4AF37', fontSize: '0.9rem' }}>{formatMoney(item.giaTien)}</span>}
                </div>
              </div>
              <div className="support-right">
                <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#D4AF37', color: '#000', border: 'none', fontWeight: 'bold' }}>
                  <i className="fas fa-hand-point-right"></i> Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="public-page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', minHeight: '60vh' }}>
      {/* Sửa Tiêu đề: Căn giữa, viết hoa toàn bộ và in đậm */}
      <h1 style={{ color: '#D4AF37', textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '3rem' }}>
        {title}
      </h1>
      
      {renderContent()}
    </main>
  );
}