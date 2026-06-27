import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; 

const schema = yup.object().shape({
  maNV: yup.string().required('Mã nhân viên không được để trống'),
  hoTen: yup.string().required('Họ tên không được để trống'),
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  soDienThoai: yup.string().required('Vui lòng nhập số điện thoại'),
  chucVu: yup.string().required('Vui lòng nhập chức vụ'),
  Role: yup.string().required('Vui lòng chọn quyền'),
  matKhau: yup.string().min(6, 'Mật khẩu phải từ 6 ký tự').required('Vui lòng nhập mật khẩu'),
});

export const AddNhanVien = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken') || '';

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      Role: 'employee',
    }
  });

  const onSubmit = (data: any) => {
    // Với dữ liệu text bình thường, chỉ cần dùng JSON.stringify (Không cần FormData)
    fetch('http://localhost:4000/nhan-vien', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("Thêm mới nhân viên thành công!");
          reset();
          setTimeout(() => navigate('/admin/nhan-vien'), 1500);
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
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="bds-form-card">
        <h2>Thêm Nhân viên mới</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="form-group">
              <label>Mã Nhân Viên (*)</label>
              <input type="text" {...register('maNV')} placeholder="VD: NV001" />
              {errors.maNV && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.maNV.message}</span>}
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
                <option value="admin">Quản trị viên (Admin)</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Mật khẩu đăng nhập (*)</label>
              <input type="password" {...register('matKhau')} placeholder="Tối thiểu 6 ký tự" />
              {errors.matKhau && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.matKhau.message}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/admin/nhan-vien')}>Hủy bỏ</button>
            <button type="submit" className="btn-submit">Lưu hệ thống</button>
          </div>
        </form>
      </div>
    </div>
  );
};