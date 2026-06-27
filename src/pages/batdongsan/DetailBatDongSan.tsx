import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DetailBatDongSan = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bds, setBds] = useState<any>(null);

  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    fetch(`http://localhost:4000/bat-dong-san/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          // Sắp xếp: Ưu tiên đưa Ảnh Đại Diện lên đầu danh sách hiển thị
          if (data.hinhAnhs && data.hinhAnhs.length > 0) {
            data.hinhAnhs.sort((a: any, b: any) => (b.anhDaiDien ? 1 : -1) - (a.anhDaiDien ? 1 : -1));
          }
          setBds(data);
        }
      })
      .catch(() => toast.error('Không thể tải chi tiết tài sản!'));
  }, [id, token]);

  if (!bds) {
    return (
      <div className="bds-container">
        <ToastContainer />
        <p style={{ color: '#f8cc46', textAlign: 'center', marginTop: '50px' }}>Đang tải dữ liệu chi tiết sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="bds-container">
      <div className="bds-detail-card">
        <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#f8cc46', margin: 0 }}>Chi tiết tài sản: {bds.id}</h2>
          <button 
            className="btn-back" 
            style={{ padding: '8px 16px', backgroundColor: '#2d2e42', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} 
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
        </div>
        
        <div className="detail-content">
          <h3 className="detail-title" style={{ marginBottom: '20px', fontSize: '24px' }}>
            {bds.tieuDe || 'Chưa cập nhật tiêu đề'}
          </h3>
          
          {/* PHẦN HIỂN THỊ TÀI NGUYÊN (ẢNH/VIDEO) */}
          {bds.hinhAnhs && bds.hinhAnhs.length > 0 ? (
            <div className="image-gallery" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '30px' }}>
              {bds.hinhAnhs.map((anh: any) => (
                <div key={anh.id} style={{ position: 'relative', width: '250px', height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2d2e42', backgroundColor: '#000' }}>
                  
                  {/* Nhận diện linh hoạt Video và Hình ảnh */}
                  {anh.duongDan && anh.duongDan.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video 
                      src={anh.duongDan} 
                      controls
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img 
                      src={anh.duongDan || ''}
                      alt={`Bất động sản ${bds.id}`} 
                      className="gallery-img" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { 
                        // BƯỚC 1: Ngắt vòng lặp vô hạn
                        e.currentTarget.onerror = null; 
                        
                        // BƯỚC 2: Dùng ảnh SVG nội bộ thay vì gọi lên mạng
                        e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22250%22%20height%3D%22180%22%20viewBox%3D%220%200%20250%20180%22%3E%3Crect%20fill%3D%22%232d2e42%22%20width%3D%22250%22%20height%3D%22180%22%2F%3E%3Ctext%20fill%3D%22%23ffffff%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EL%E1%BB%97i%20%E1%BA%A3nh%3C%2Ftext%3E%3C%2Fsvg%3E';
                      }}
                    />
                  )}

                  {/* Đánh dấu ảnh đại diện */}
                  {anh.anhDaiDien && (
                    <span style={{ 
                      position: 'absolute', top: '10px', left: '10px', 
                      backgroundColor: '#e74c3c', color: '#fff', 
                      padding: '4px 8px', borderRadius: '4px',
                      fontSize: '12px', fontWeight: 'bold' 
                    }}>
                      Ảnh đại diện
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontStyle: 'italic', color: '#999', marginBottom: '30px' }}>Chưa có hình ảnh cho tài sản này.</p>
          )}

          {/* THÔNG TIN CHI TIẾT */}
          <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div className="detail-item"><strong>Khách hàng:</strong> <span style={{ color: '#c4c4d4' }}>{bds.khachHangId}</span></div>
            <div className="detail-item"><strong>Loại hình:</strong> <span style={{ color: '#c4c4d4' }}>{bds.loaiBDS}</span></div>
            <div className="detail-item"><strong>Nhu cầu:</strong> <span style={{ color: '#c4c4d4' }}>{bds.nhuCau || 'Không có'}</span></div>
            <div className="detail-item"><strong>Diện tích:</strong> <span style={{ color: '#c4c4d4' }}>{bds.dienTich} m²</span></div>
            <div className="detail-item"><strong>Giá niêm yết:</strong> <span style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '18px' }}>{Number(bds.giaTien).toLocaleString('vi-VN')} VNĐ</span></div>
            <div className="detail-item"><strong>Tình trạng:</strong> <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>{bds.tinhTrang}</span></div>
            <div className="detail-item"><strong>Ngày khởi tạo:</strong> <span style={{ color: '#c4c4d4' }}>{new Date(bds.ngayTao).toLocaleDateString('vi-VN')}</span></div>
            
            <div className="detail-item"><strong>Hướng:</strong> <span style={{ color: '#c4c4d4' }}>{bds.huong || 'Chưa cập nhật'}</span></div>
            <div className="detail-item"><strong>Vị trí:</strong> <span style={{ color: '#c4c4d4' }}>{bds.viTri || 'Chưa cập nhật'}</span></div>
          </div>
          
          <div className="detail-full-width" style={{ marginBottom: '20px' }}>
            <strong>Địa chỉ tài sản:</strong>
            <p style={{ marginTop: '8px', color: '#c4c4d4' }}>{bds.diaChi}</p>
          </div>

          <div className="detail-full-width">
            <strong>Ghi chú / Mô tả chi tiết:</strong>
            <div style={{ 
              marginTop: '8px', 
              color: '#c4c4d4', 
              backgroundColor: '#13141f', 
              padding: '15px', 
              borderRadius: '8px', 
              border: '1px solid #2d2e42',
              whiteSpace: 'pre-wrap'
            }}>
              {bds.ghiChu || 'Không có ghi chú nào cho tài sản này.'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetailBatDongSan;