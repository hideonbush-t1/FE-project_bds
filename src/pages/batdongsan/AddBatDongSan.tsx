import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BatDongSan.css';

const AddBatDongSan = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    khachHangId: '',
    tieuDe: '',
    loaiBDS: 'Nhà ở',
    nhuCau: 'Bán',
    diaChi: '',
    dienTich: '',
    giaTien: '',
    tinhTrang: 'Có sẵn',
    huong: '',
    moTa: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Làm sạch dữ liệu, nhưng GIỮ NGUYÊN KIỂU CHUỖI (String) cho giaTien
    const rawGiaTien = String(formData.giaTien).replace(/[,.\s]/g, '');

    fetch('http://localhost:4000/bat-dong-san', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        dienTich: Number(formData.dienTich), // Diện tích BE vẫn nhận số
        giaTien: rawGiaTien // Đã bỏ Number(), gửi nguyên chuỗi lên cho BE
      })
    })
      .then((response) => {
        if (response.ok) {
          alert('Thêm mới bất động sản thành công!');
          navigate('/admin/bat-dong-san');
        } else {
          response.json().then(err => {
             console.error('Chi tiết lỗi từ BE:', err);
             alert('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!');
          });
        }
      })
      .catch(() => {
        alert('Không thể kết nối đến máy chủ Backend!');
      });
  };
  return (
    <div className="bds-container">
      <div className="bds-form-card">
        <h2>Thêm Bất động sản mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Mã khách hàng sở hữu</label>
              <input type="text" name="khachHangId" value={formData.khachHangId} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Tiêu đề tin đăng</label>
              <input type="text" name="tieuDe" value={formData.tieuDe} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Loại bất động sản</label>
              <select name="loaiBDS" value={formData.loaiBDS} onChange={handleChange}>
                <option value="Nhà ở">Nhà ở</option>
                <option value="Đất nền">Đất nền</option>
                <option value="Chung cư">Chung cư</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nhu cầu chính</label>
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
            <div className="form-group">
              <label>Hướng nhà đất</label>
              <input type="text" name="huong" value={formData.huong} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Tình trạng giao dịch</label>
              <select name="tinhTrang" value={formData.tinhTrang} onChange={handleChange}>
                <option value="Có sẵn">Có sẵn</option>
                <option value="Đã bán">Đã bán</option>
                <option value="Đã thuê">Đã thuê</option>
              </select>
            </div>
          </div>
          <div className="form-group full-width">
            <label>Địa chỉ chi tiết</label>
            <input type="text" name="diaChi" value={formData.diaChi} onChange={handleChange} required />
          </div>
          <div className="form-group full-width">
            <label>Mô tả chi tiết sản phẩm</label>
            <textarea name="moTa" rows={4} value={formData.moTa} onChange={handleChange}></textarea>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/admin/bat-dong-san')}>Hủy bỏ</button>
            <button type="submit" className="btn-submit">Lưu lại</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBatDongSan;