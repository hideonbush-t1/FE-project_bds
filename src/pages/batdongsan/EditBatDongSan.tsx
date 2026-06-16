import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './BatDongSan.css';

const EditBatDongSan = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    khachHangId: '',
    tieuDe: '',
    loaiBDS: '',
    nhuCau: '',
    diaChi: '',
    dienTich: '',
    giaTien: '',
    tinhTrang: ''
  });

  useEffect(() => {
    fetch(`http://localhost:4000/bat-dong-san`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const target = data.find((item) => item.id === id);
          if (target) {
            setFormData({
              khachHangId: target.khachHangId || '',
              tieuDe: target.tieuDe || '',
              loaiBDS: target.loaiBDS || 'Nhà ở',
              nhuCau: target.nhuCau || 'Bán',
              diaChi: target.diaChi || '',
              dienTich: target.dienTich || '',
              giaTien: target.giaTien || '',
              tinhTrang: target.tinhTrang || 'Có sẵn'
            });
          }
        }
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rawGiaTien = String(formData.giaTien).replace(/[,.\s]/g, '');

    fetch(`http://localhost:4000/bat-dong-san/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        dienTich: Number(formData.dienTich),
        giaTien: rawGiaTien // Gửi nguyên chuỗi lên cho BE
      })
    })
      .then((response) => {
        if (response.ok) {
          alert('Cập nhật thông tin bất động sản thành công!');
          navigate('/admin/bat-dong-san');
        } else {
          response.json().then(err => {
             console.error('Chi tiết lỗi từ BE:', err);
             alert('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!');
          });
        }
      })
      .catch(() => {
        alert('Lỗi kết nối mạng!');
      });
  };

  return (
    <div className="bds-container">
      <div className="bds-form-card">
        <h2>Chỉnh sửa thông tin Bất động sản</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Mã khách hàng</label>
              <input type="text" name="khachHangId" value={formData.khachHangId} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Tiêu đề</label>
              <input type="text" name="tieuDe" value={formData.tieuDe} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Loại BĐS</label>
              <select name="loaiBDS" value={formData.loaiBDS} onChange={handleChange}>
                <option value="Nhà ở">Nhà ở</option>
                <option value="Đất nền">Đất nền</option>
                <option value="Chung cư">Chung cư</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nhu cầu</label>
              <select name="nhuCau" value={formData.nhuCau} onChange={handleChange}>
                <option value="Bán">Bán</option>
                <option value="Cho thuê">Cho thuê</option>
              </select>
            </div>
            <div className="form-group">
              <label>Diện tích (m2)</label>
              <input type="number" name="dienTich" value={formData.dienTich} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Giá tiền (VNĐ)</label>
              <input type="number" name="giaTien" value={formData.giaTien} onChange={handleChange} required />
            </div>
            <div className="form-group full-width">
              <label>Địa chỉ</label>
              <input type="text" name="diaChi" value={formData.diaChi} onChange={handleChange} required />
            </div>
            <div className="form-group full-width">
              <label>Tình trạng giao dịch</label>
              <select name="tinhTrang" value={formData.tinhTrang} onChange={handleChange}>
                <option value="Có sẵn">Có sẵn</option>
                <option value="Đã bán">Đã bán</option>
                <option value="Đã thuê">Đã thuê</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/admin/bat-dong-san')}>Hủy</button>
            <button type="submit" className="btn-submit">Cập nhật</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBatDongSan;