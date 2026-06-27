import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../batdongsan/BatDongSan.css'; 

// 💡 Đã gỡ bỏ hoàn toàn matKhau khỏi schema kiểm tra
const schema = yup.object().shape({
  hoTen: yup.string().required('Họ tên không được để trống'),
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  soDienThoai: yup.string().required('Vui lòng nhập số điện thoại'),
  chucVu: yup.string().required('Vui lòng nhập chức vụ'),
  Role: yup.string().required('Vui lòng chọn quyền'),
});

export const EditNhanVien = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken') || '';

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    fetch(`http://localhost:4000/nhan-vien/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        const nv = data.data || data; 
        setValue('hoTen', nv.hoTen);
        setValue('email', nv.email);
        setValue('soDienThoai', nv.soDienThoai);
        setValue('chucVu', nv.chucVu);
        setValue('Role', String(nv.Role || nv.role).toLowerCase() === 'admin' ? 'admin' : 'employee');
      })
      .catch(() => toast.error('Lỗi khi tải thông tin nhân viên!'));
  }, [id, token, setValue]);

  const onSubmit = (data: any) => {
    fetch(`http://localhost:4000/nhan-vien/${id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data), // 💡 Đẩy thẳng data lên vì không còn dính dáng đến mật khẩu
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("Cập nhật thành công!");
          setTimeout(() => navigate('/admin/nhan-vien'), 1500);
        } else {
          const errorData = await response.json();
          toast.error(`Lỗi: ${errorData.message}`);
        }
      })
      .catch(() => toast.error("Mất kết nối máy chủ!"));
  };

  return (
    <div className="bds-container">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="bds-form-card">
        <h2>Cập nhật thông tin Nhân viên</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="form-group">
              <label>Mã Nhân Viên (Không được sửa)</label>
              <input type="text" value={id} disabled style={{ backgroundColor: '#2d2e42', cursor: 'not-allowed' }} />
            </div>

            <div className="form-group">
              <label>Họ và tên (*)</label>
              <input type="text" {...register('hoTen')} />
              {errors.hoTen && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.hoTen.message}</span>}
            </div>

            <div className="form-group">
              <label>Email (*)</label>
              <input type="email" {...register('email')} />
              {errors.email && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label>Số điện thoại (*)</label>
              <input type="text" {...register('soDienThoai')} />
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
            
            {/* 💡 Ô Mật khẩu đã được gỡ bỏ hoàn toàn khỏi form */}
          </div>

          <div className="form-actions mt-4">
            <button type="button" className="btn-cancel" onClick={() => navigate('/admin/nhan-vien')}>Hủy bỏ</button>
            <button type="submit" className="btn-submit">Cập nhật hệ thống</button>
          </div>
        </form>
      </div>
    </div>
  );
};