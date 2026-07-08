import React from 'react';

export function SchedulePage() {
  // Dữ liệu giả lập (Mock data) y hệt bản thiết kế HTML gốc
  const scheduleData = [
    { id: 1, ngay: '22/02/2026', caLam: 'Ca sáng', boPhan: 'Lễ tân', nhanVien: 'Nguyễn Văn An', ghiChu: 'Trực khách hàng' },
    { id: 2, ngay: '22/02/2026', caLam: 'Ca chiều', boPhan: 'Kinh doanh', nhanVien: 'Trần Thị Bình', ghiChu: 'Tư vấn dự án' },
    { id: 3, ngay: '23/02/2026', caLam: 'Ca sáng', boPhan: 'Giao dịch', nhanVien: 'Lê Văn Cường', ghiChu: 'Hỗ trợ hợp đồng' },
  ];

  return (
    <main className="public-page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', minHeight: '60vh' }}>
      <h1 style={{ color: '#D4AF37', textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '3rem' }}>
        LỊCH LÀM VIỆC
      </h1>

      <div className="table-responsive" style={{ border: '1px solid #D4AF37', borderRadius: '8px', overflow: 'hidden' }}>
        <table className="table table-dark table-striped table-hover mb-0">
          <thead style={{ borderBottom: '2px solid #D4AF37' }}>
            <tr>
              <th style={{ color: '#D4AF37', padding: '1rem' }}>STT</th>
              <th style={{ color: '#D4AF37', padding: '1rem' }}>Ngày</th>
              <th style={{ color: '#D4AF37', padding: '1rem' }}>Ca Làm</th>
              <th style={{ color: '#D4AF37', padding: '1rem' }}>Bộ Phận</th>
              <th style={{ color: '#D4AF37', padding: '1rem' }}>Nhân Viên Phụ Trách</th>
              <th style={{ color: '#D4AF37', padding: '1rem' }}>Ghi Chú</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((item, index) => (
              <tr key={item.id}>
                <td style={{ padding: '1rem' }}>{index + 1}</td>
                <td style={{ padding: '1rem' }}>{item.ngay}</td>
                <td style={{ padding: '1rem' }}>{item.caLam}</td>
                <td style={{ padding: '1rem' }}>{item.boPhan}</td>
                <td style={{ padding: '1rem' }}>{item.nhanVien}</td>
                <td style={{ padding: '1rem' }}>{item.ghiChu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}   