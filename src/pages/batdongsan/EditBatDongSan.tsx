import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const schema = yup.object().shape({
  khachHangId: yup.string().required('Vui lòng chọn khách hàng sở hữu'),
  loaiBDS: yup.string().required('Vui lòng chọn loại BĐS'),
  diaChi: yup.string().required('Địa chỉ không được để trống'),
  dienTich: yup.number().typeError('Diện tích phải là số').positive('Diện tích > 0').required('Vui lòng nhập diện tích'),
  giaTien: yup.number().typeError('Giá tiền phải là số').positive('Giá > 0').required('Vui lòng nhập giá tiền'),
  tinhTrang: yup.string().required('Vui lòng chọn tình trạng'),
  
  tieuDe: yup.string().nullable(),
  nhuCau: yup.string().nullable(),
  viTri: yup.string().nullable(),
  huong: yup.string().nullable(),
  ghiChu: yup.string().nullable(),
});

const EditBatDongSan = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [khachHangList, setKhachHangList] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const token = localStorage.getItem('accessToken') || '';

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    fetch('http://localhost:4000/khach-hang', { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setKhachHangList(data); })
      .catch(() => toast.error('Lỗi tải danh sách khách hàng!'));

    fetch(`http://localhost:4000/bat-dong-san/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          // Reset data kéo từ DB xuống
          reset({
            khachHangId: data.khachHangId || '',
            tieuDe: data.tieuDe || '',
            loaiBDS: data.loaiBDS || 'Nhà ở',
            nhuCau: data.nhuCau || 'Bán',
            diaChi: data.diaChi || '',
            dienTich: data.dienTich || '',
            giaTien: data.giaTien || '',
            tinhTrang: data.tinhTrang || 'Đang bán',
            viTri: data.viTri || '',
            huong: data.huong || '',
            ghiChu: data.ghiChu || ''
          });
        }
      })
      .catch(() => toast.error('Lỗi tải dữ liệu tài sản!'));
  }, [id, reset, token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(e.target.files);
  };

  const onSubmit = (data: any) => {
    const formData = new FormData();
    
    formData.append('khachHangId', String(data.khachHangId));
    formData.append('loaiBDS', String(data.loaiBDS));
    formData.append('diaChi', String(data.diaChi));
    formData.append('dienTich', String(data.dienTich)); 
    formData.append('giaTien', String(data.giaTien));   
    formData.append('tinhTrang', String(data.tinhTrang));

    if (data.tieuDe) formData.append('tieuDe', String(data.tieuDe));
    if (data.nhuCau) formData.append('nhuCau', String(data.nhuCau));
    if (data.viTri) formData.append('viTri', String(data.viTri));
    if (data.huong) formData.append('huong', String(data.huong));
    if (data.ghiChu) formData.append('ghiChu', String(data.ghiChu));

    if (selectedFiles && selectedFiles.length > 0) {
      Array.from(selectedFiles).forEach((file) => {
        formData.append('images', file);
      });
    }

    const toastId = toast.loading('Đang cập nhật dữ liệu...');

    fetch(`http://localhost:4000/bat-dong-san/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    })
      .then(async (response) => {
        if (response.ok) {
          toast.update(toastId, { render: "Cập nhật tài sản thành công!", type: "success", isLoading: false, autoClose: 2000 });
          setTimeout(() => navigate('/admin/bat-dong-san'), 2000);
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
        <h2>Chỉnh sửa Bất động sản: {id}</h2>
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
              {errors.khachHangId && <span className="error-text">{errors.khachHangId.message}</span>}
            </div>

            <div className="form-group">
              <label>Tiêu đề tin đăng</label>
              <input type="text" {...register('tieuDe')} />
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
              {errors.dienTich && <span className="error-text">{errors.dienTich.message}</span>}
            </div>

            <div className="form-group">
              <label>Giá tiền (VNĐ) (*)</label>
              <input type="number" {...register('giaTien')} />
              {errors.giaTien && <span className="error-text">{errors.giaTien.message}</span>}
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
              <input type="text" {...register('viTri')} />
            </div>

            {/* Hàng Full Width */}
            <div className="form-group full-width">
              <label>Địa chỉ chi tiết (*)</label>
              <input type="text" {...register('diaChi')} />
              {errors.diaChi && <span className="error-text">{errors.diaChi.message}</span>}
            </div>

            <div className="form-group full-width">
              <label>Ghi chú / Mô tả chi tiết</label>
              <textarea {...register('ghiChu')} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#13141f', color: '#fff', border: '1px solid #2d2e42' }}></textarea>
            </div>

            <div className="form-group full-width">
              <label>Tải thêm Hình ảnh BĐS</label>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="file-input" style={{ background: 'transparent', border: 'none' }} />
              <small style={{ color: '#bdc3c7' }}>Chọn ảnh mới nếu bạn muốn thay thế ảnh cũ (Để trống nếu muốn giữ nguyên).</small>
            </div>

            <div className="form-group full-width">
              <label>Tình trạng giao dịch (*)</label>
              <select {...register('tinhTrang')}>
                <option value="Đang bán">Đang bán</option>
                <option value="Đang cho thuê">Đang cho thuê</option>
                <option value="Đã bán">Đã bán</option>
                <option value="Đã cho thuê">Đã cho thuê</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/admin/bat-dong-san')}>Hủy bỏ</button>
            <button type="submit" className="btn-submit">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBatDongSan;