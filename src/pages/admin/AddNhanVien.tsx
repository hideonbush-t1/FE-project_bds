import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; 

// 1. Đã gỡ bỏ maNV và matKhau khỏi schema vì hệ thống tự động sinh ra
const schema = yup.object().shape({
  hoTen: yup.string().required('Họ tên không được để trống'),
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  soDienThoai: yup.string().required('Vui lòng nhập số điện thoại'),
  chucVu: yup.string().required('Vui lòng chọn chức vụ'),
  Role: yup.string().required('Vui lòng chọn quyền'),
});

export const AddNhanVien = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken') || '';
  
  // 2. State lưu mã nhân viên tự động
  const [maNVMoi, setMaNVMoi] = useState('Đang tải...');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      Role: 'employee',
      chucVu: ''
    }
  });

  // 3. Tự động lấy danh sách và tính toán mã nhân viên tiếp theo (Không bị trùng)
  useEffect(() => {
    fetch('http://localhost:4000/nhan-vien', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || []);
        const maxCode = list.reduce((max: number, nv: any) => {
          const num = parseInt((nv.id || nv.maNV || '').replace('NV', ''), 10);
          return !isNaN(num) ? Math.max(max, num) : max;
        }, 0);
        
        setMaNVMoi(`NV${(maxCode + 1).toString().padStart(3, '0')}`);
      })
      .catch(() => toast.error('Lỗi khi tải dữ liệu mã nhân viên!'));
  }, [token]);

  // 4. Hàm tạo mật khẩu ngẫu nhiên (8 ký tự)
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const onSubmit = (data: any) => {
    // Tạo pass ngẫu nhiên
    const randomPassword = generateRandomPassword();
    
    // Gộp dữ liệu form với mã NV và pass tự động
    const payload = {
      ...data,
      maNV: maNVMoi, 
      matKhau: randomPassword 
    };

    fetch('http://localhost:4000/nhan-vien', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (response.ok) {
          // 5. Hiện pop-up thông báo MẬT KHẨU để Admin copy gửi cho nhân viên
          toast.success(
            <div>
              Thêm thành công!<br/>
              Mật khẩu user là: <strong style={{color: '#f1c40f'}}>{randomPassword}</strong>
            </div>, 
            { autoClose: false } // Giữ thông báo trên màn hình để Admin kịp copy
          );
          reset();
          setTimeout(() => navigate('/admin/nhan-vien'), 4000);
        } else {
          const errorData = await response.json();
          let errorMessage = Array.isArray(errorData.message) ? errorData.message[0] : errorData.message;
          toast.error(`Lỗi: ${errorMessage}`);
        }
      })
      .catch(() => toast.error("Mất kết nối máy chủ!"));
  };

  return (
    <div className="bds-container">
      <ToastContainer position="top-right" />
      <div className="bds-form-card">
        <h2>Thêm Nhân viên mới</h2>
        <p style={{ color: '#bdc3c7', marginBottom: '20px', fontStyle: 'italic' }}>
          * Mã nhân viên và Mật khẩu sẽ được hệ thống sinh tự động để đảm bảo bảo mật.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            
            {/* 💡 Ô Nhập Mã NV đã bị khóa (readOnly) và tự động điền */}
            <div className="form-group">
              <label>Mã Nhân Viên (Tự động)</label>
              <input type="text" value={maNVMoi} readOnly style={{ backgroundColor: '#2d2e42', cursor: 'not-allowed', color: '#f1c40f', fontWeight: 'bold' }} />
            </div>

            <div className="form-group">
              <label>Họ và tên (*)</label>
              <input type="text" {...register('hoTen')} placeholder="Nhập họ và tên" />
              {errors.hoTen && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.hoTen.message}</span>}
            </div>

            <div className="form-group">
              <label>Email (*)</label>
              <input type="email" {...register('email')} placeholder="example@gmail.com" />
              {errors.email && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label>Số điện thoại (*)</label>
              <input type="text" {...register('soDienThoai')} placeholder="Nhập số điện thoại" />
              {errors.soDienThoai && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.soDienThoai.message}</span>}
            </div>

            <div className="form-group">
              <label>Chức vụ (*)</label>
              <select {...register('chucVu')}>
                <option value="">-- Chọn chức vụ --</option>
                <option value="Nhân viên kinh doanh">Nhân viên kinh doanh</option>
                <option value="Trưởng phòng">Trưởng phòng</option>
                <option value="Kế toán">Kế toán</option>
                <option value="Nhân sự">Nhân sự</option>
                <option value="Giám đốc">Giám đốc</option>
                <option value="Chuyên viên">Chuyên viên</option>
                <option value="Nhân viên tư vấn">Nhân viên tư vấn</option>
                <option value="Trưởng phòng kinh doanh">Trưởng phòng kinh doanh</option>
              </select>
              {errors.chucVu && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.chucVu.message}</span>}
            </div>

            <div className="form-group">
              <label>Quyền hệ thống (*)</label>
              <select {...register('Role')}>
                <option value="employee">Nhân viên (Employee)</option>
                {/* Ẩn option Admin đi để tránh vô ý tạo thêm tài khoản Admin */}
              </select>
            </div>
            
            {/* 💡 Ô nhập mật khẩu đã được xóa bỏ hoàn toàn */}
            
          </div>

          <div className="form-actions mt-4">
            <button type="button" className="btn-cancel" onClick={() => navigate('/admin/nhan-vien')}>Hủy bỏ</button>
            <button type="submit" className="btn-submit">Lưu hệ thống</button>
          </div>
        </form>
      </div>
    </div>
  );
};