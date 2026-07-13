import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const PropertyDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bds, setBds] = useState<any>(null);

  useEffect(() => {
  const token = localStorage.getItem('accessToken'); // Lấy token đã lưu khi login

  fetch(`http://localhost:4000/public/bat-dong-san/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`, // Đính kèm token
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      if (res.status === 401) {
        throw new Error('Bạn cần đăng nhập để xem thông tin này!');
      }
      return res.json();
    })
    .then(data => setBds(data))
    .catch(err => console.error("Lỗi:", err));
}, [id]);

  if (!bds) return <div className="text-center py-20">Đang tải thông tin dự án...</div>;

  return (
    <div style={{ backgroundColor: '#111111', color: '#ffffff', minHeight: '100vh', padding: '40px 0' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Nút Quay lại */}
        <button onClick={() => navigate(-1)} style={{ 
          marginBottom: '20px', padding: '10px 20px', cursor: 'pointer', 
          backgroundColor: '#222', color: '#D4AF37', border: '1px solid #D4AF37', borderRadius: '5px' 
        }}>
          &larr; Quay lại danh sách
        </button>

        {/* Header */}
        <h1 style={{ color: '#D4AF37', fontSize: '2.5rem' }}>{bds.tieuDe}</h1>
        <p style={{ color: '#ccc', marginBottom: '30px' }}><i className="fas fa-map-marker-alt"></i> {bds.diaChi}</p>

        {/* PHẦN GALLERY */}
        <div style={{ marginBottom: '30px' }}>
          {/* Ảnh chính lớn */}
          <img 
            src={bds.hinhAnhs?.[0]?.duongDan || 'placeholder.jpg'} 
            style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px' }} 
            alt="Chính" 
          />
          
          {/* Hàng ngang các ảnh còn lại - Hình vuông */}
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto' }}>
            {bds.hinhAnhs?.slice(1).map((h: any, i: number) => (
              <img 
                key={i} 
                src={h.duongDan} 
                style={{ 
                  width: '150px', 
                  height: '150px', 
                  objectFit: 'cover', 
                  borderRadius: '8px', 
                  border: '2px solid #333' 
                }} 
                alt="Ảnh phụ" 
              />
            ))}
          </div>
        </div>

        {/* Thông tin chi tiết (Giữ tông màu tối) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
          <div style={{ background: '#1a1a1a', padding: '25px', borderRadius: '10px' }}>
             <h3>Mô tả chi tiết</h3>
             <p style={{ color: '#ccc', lineHeight: '1.8' }}>{bds.ghiChu || 'Chưa có mô tả'}</p>
          </div>

          <div style={{ background: '#1a1a1a', padding: '25px', borderRadius: '10px', border: '1px solid #333' }}>
            <h3 style={{ color: '#D4AF37' }}>Thông tin cơ bản</h3>
            <p>Diện tích: <strong>{bds.dienTich} m²</strong></p>
            <p>Loại hình: <strong>{bds.loaiBDS}</strong></p>
            <h2 style={{ color: '#fff', fontSize: '2rem' }}>{Number(bds.giaTien).toLocaleString('vi-VN')} VNĐ</h2>
            <button style={{ width: '100%', padding: '15px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
              Liên hệ tư vấn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
