import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 1. Cập nhật schema chuẩn theo Prisma (Các trường có dấu ? trong Prisma không dùng .required)
const schema = yup.object().shape({
  khachHangId: yup.string().required('Vui lòng chọn khách hàng sở hữu'),
  loaiBDS: yup.string().required('Vui lòng chọn loại BĐS'),
  diaChi: yup.string().required('Địa chỉ không được để trống'),
  dienTich: yup.number().typeError('Diện tích phải là số').positive('Diện tích > 0').required('Vui lòng nhập diện tích'),
  giaTien: yup.number().typeError('Giá tiền phải là số').positive('Giá > 0').required('Vui lòng nhập giá tiền'),
  tinhTrang: yup.string().required('Vui lòng chọn tình trạng'),
  
  // Các trường Optionals (Khớp với string? trong Prisma)
  tieuDe: yup.string().nullable(),
  nhuCau: yup.string().nullable(),
  viTri: yup.string().nullable(),
  huong: yup.string().nullable(),
  ghiChu: yup.string().nullable(),
});

const AddBatDongSan = () => {
  const navigate = useNavigate();
  const [khachHangList, setKhachHangList] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const token = localStorage.getItem('accessToken') || '';

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      loaiBDS: 'Nhà ở',
      nhuCau: 'Bán',
      tinhTrang: 'Đang bán',
    }
  });

  useEffect(() => {
    fetch('http://localhost:4000/khach-hang', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setKhachHangList(data); })
      .catch(() => toast.error('Lỗi khi tải danh sách Khách hàng!'));
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(e.target.files);
  };

  const onSubmit = (data: any) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 hình ảnh!');
      return;
    }

    const formData = new FormData();
    
    // Nạp các trường bắt buộc (Required)
    formData.append('khachHangId', String(data.khachHangId));
    formData.append('loaiBDS', String(data.loaiBDS));
    formData.append('diaChi', String(data.diaChi));
    formData.append('dienTich', String(data.dienTich)); 
    formData.append('giaTien', String(data.giaTien));
    formData.append('tinhTrang', String(data.tinhTrang));

    // Nạp các trường tuỳ chọn (Optional) - Chỉ nạp khi user có nhập
    if (data.tieuDe) formData.append('tieuDe', String(data.tieuDe));
    if (data.nhuCau) formData.append('nhuCau', String(data.nhuCau));
    if (data.viTri) formData.append('viTri', String(data.viTri));
    if (data.huong) formData.append('huong', String(data.huong));
    if (data.ghiChu) formData.append('ghiChu', String(data.ghiChu));

    // Nạp mảng ảnh
    Array.from(selectedFiles).forEach((file) => {
      formData.append('images', file);
    });

    const toastId = toast.loading('Đang tải dữ liệu và hình ảnh lên hệ thống...');

    fetch('http://localhost:4000/bat-dong-san', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    })
      .then(async (response) => {
        if (response.ok) {
          toast.update(toastId, { render: "Thêm mới BĐS thành công!", type: "success", isLoading: false, autoClose: 3000 });
          setSelectedFiles(null);
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          reset();
        } else {
          const errorData = await response.json();
          let errorMessage = Array.isArray(errorData.message) ? errorData.message[0] : errorData.message;
          toast.update(toastId, { render: `Backend từ chối: ${errorMessage}`, type: "error", isLoading: false, autoClose: 5000 });
        }
      })
      .catch(() => toast.update(toastId, { render: "Mất kết nối máy chủ!", type: "error", isLoading: false, autoClose: 5000 }));
  };

  return (
    <div className="bds-container">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="bds-form-card">
        <h2>Thêm Bất động sản mới</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            {/* Hàng 1 */}
            <div className="form-group">
              <label>Khách hàng sở hữu (*)</label>
              <select {...register('khachHangId')}>
                <option value="">-- Chọn khách hàng --</option>
                {khachHangList.map(kh => (
                  <option key={kh.id} value={kh.id}>{kh.id} - {kh.hoTen}</option>
                ))}
              </select>
              {errors.khachHangId && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.khachHangId.message}</span>}
            </div>

            <div className="form-group">
              <label>Tiêu đề tin đăng</label>
              <input type="text" {...register('tieuDe')} placeholder="Nhập tiêu đề (nếu có)" />
            </div>

            {/* Hàng 2 */}
            <div className="form-group">
              <label>Loại bất động sản (*)</label>
              <select {...register('loaiBDS')}>
                <option value="Nhà ở">Nhà ở</option>
                <option value="Đất nền">Đất nền</option>
                <option value="Căn hộ chung cư">Căn hộ chung cư</option>
                <option value="Biệt thự">Biệt thự</option>
                <option value="Văn phòng">Văn phòng</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nhu cầu chính</label>
              <select {...register('nhuCau')}>
                <option value="Bán">Bán</option>
                <option value="Cho thuê">Cho thuê</option>
              </select>
            </div>

            {/* Hàng 3 */}
            <div className="form-group">
              <label>Diện tích (m2) (*)</label>
              <input type="number" step="any" {...register('dienTich')} />
              {errors.dienTich && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.dienTich.message}</span>}
            </div>

            <div className="form-group">
              <label>Giá tiền (VNĐ) (*)</label>
              <input type="number" {...register('giaTien')} />
              {errors.giaTien && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.giaTien.message}</span>}
            </div>

            {/* Hàng 4: Các trường mới thêm */}
            <div className="form-group">
              <label>Hướng nhà/đất</label>
              <select {...register('huong')}>
                <option value="">-- Chọn hướng --</option>
                <option value="Đông">Đông</option>
                <option value="Tây">Tây</option>
                <option value="Nam">Nam</option>
                <option value="Bắc">Bắc</option>
                <option value="Đông Nam">Đông Nam</option>
                <option value="Đông Bắc">Đông Bắc</option>
                <option value="Tây Nam">Tây Nam</option>
                <option value="Tây Bắc">Tây Bắc</option>
              </select>
            </div>

            <div className="form-group">
              <label>Vị trí (Mặt tiền, Hẻm...)</label>
              <input type="text" {...register('viTri')} placeholder="VD: Hẻm xe hơi 5m" />
            </div>

            {/* Hàng Full Width */}
            <div className="form-group full-width">
              <label>Địa chỉ chi tiết (*)</label>
              <input type="text" {...register('diaChi')} />
              {errors.diaChi && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.diaChi.message}</span>}
            </div>

            <div className="form-group full-width">
              <label>Ghi chú / Mô tả chi tiết</label>
              <textarea {...register('ghiChu')} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#13141f', color: '#fff', border: '1px solid #2d2e42' }} placeholder="Nhập thêm thông tin mô tả chi tiết tài sản..."></textarea>
            </div>

            <div className="form-group full-width">
              <label>Tải lên Hình ảnh BĐS (*)</label>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ background: 'transparent', border: 'none' }} />
            </div>

            <div className="form-group full-width">
              <label>Tình trạng giao dịch (*)</label>
              <select {...register('tinhTrang')}>
                <option value="Đang bán">Đang bán</option>
                <option value="Đang cho thuê">Đang cho thuê</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/admin/bat-dong-san')}>Hủy bỏ</button>
            <button type="submit" className="btn-submit">Lưu lại hệ thống</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBatDongSan;