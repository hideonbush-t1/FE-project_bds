import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './BatDongSan.css';

const DetailBatDongSan = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bds, setBds] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:4000/bat-dong-san')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const target = data.find((item) => item.id === id);
          if (target) {
            setBds(target);
          }
        }
      });
  }, [id]);

  if (!bds) {
    return (
      <div className="bds-container">
        <p style={{ color: '#f1c40f', textAlign: 'center' }}>Đang tải dữ liệu chi tiết sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="bds-container">
      <div className="bds-detail-card">
        <div className="detail-header">
          <h2>Chi tiết tài sản: {bds.id}</h2>
          <button className="btn-back" onClick={() => navigate('/admin/bat-dong-san')}>Quay lại</button>
        </div>
        <div className="detail-content">
          <h3 className="detail-title">{bds.tieuDe}</h3>
          <div className="detail-grid">
            <div className="detail-item"><strong>Mã khách hàng:</strong> <span>{bds.khachHangId}</span></div>
            <div className="detail-item"><strong>Loại hình:</strong> <span>{bds.loaiBDS}</span></div>
            <div className="detail-item"><strong>Nhu cầu:</strong> <span>{bds.nhuCau || 'N/A'}</span></div>
            <div className="detail-item"><strong>Diện tích:</strong> <span>{bds.dienTich} m²</span></div>
            <div className="detail-item"><strong>Giá niêm yết:</strong> <span className="highlight">{Number(bds.giaTien).toLocaleString('vi-VN')} VNĐ</span></div>
            <div className="detail-item"><strong>Hướng tài sản:</strong> <span>{bds.huong || 'Chưa cập nhật'}</span></div>
            <div className="detail-item"><strong>Tình trạng:</strong> <span className="status available">{bds.tinhTrang}</span></div>
            <div className="detail-item"><strong>Ngày khởi tạo:</strong> <span>{new Date(bds.ngayTao).toLocaleDateString('vi-VN')}</span></div>
          </div>
          <div className="detail-full-width">
            <strong>Địa chỉ tài sản:</strong>
            <p>{bds.diaChi}</p>
          </div>
          <div className="detail-full-width">
            <strong>Mô tả chi tiết nội dung:</strong>
            <p>{bds.ghiChu || 'Không có mô tả bổ sung cho bất động sản này.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailBatDongSan;