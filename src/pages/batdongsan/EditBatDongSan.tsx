import React, { useState, useEffect, useRef } from 'react';
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
  
  // State quản lý danh sách khách hàng và bộ tìm kiếm
  const [khachHangList, setKhachHangList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // State quản lý tài nguyên (Ảnh cũ từ DB + File mới tải lên)
  const [oldImages, setOldImages] = useState<any[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewItems, setPreviewItems] = useState<{ url: string; type: string }[]>([]);

  const token = localStorage.getItem('accessToken') || '';

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const currentKhId = watch('khachHangId');

  // Đóng dropdown tìm kiếm khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    // 1. Lấy danh sách khách hàng
    fetch('http://localhost:4000/khach-hang', { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setKhachHangList(data); })
      .catch(() => toast.error('Lỗi tải danh sách khách hàng!'));

    // 2. Lấy chi tiết BĐS
    fetch(`http://localhost:4000/bat-dong-san/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
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
          // Lưu ảnh cũ vào state để hiển thị
          if (data.hinhAnhs) setOldImages(data.hinhAnhs);
        }
      })
      .catch(() => toast.error('Lỗi tải dữ liệu tài sản!'));
  }, [id, reset, token]);

  // Tự động điền Tên khách hàng vào ô tìm kiếm khi load xong dữ liệu
  useEffect(() => {
    if (currentKhId && khachHangList.length > 0 && !searchTerm) {
      const kh = khachHangList.find(k => k.id === currentKhId);
      if (kh) setSearchTerm(`${kh.hoTen} - ${kh.soDienThoai}`);
    }
  }, [currentKhId, khachHangList, searchTerm]);

  const filteredKhachHang = khachHangList.filter(kh =>
    kh.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kh.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (kh.soDienThoai && kh.soDienThoai.includes(searchTerm))
  );

  // XÓA ẢNH CŨ
  const handleRemoveOldImage = (idToRemove: number) => {
    setOldImages(prev => prev.filter(img => img.id !== idToRemove));
    setDeletedImageIds(prev => [...prev, idToRemove]); // Lưu lại ID để gửi báo Backend xóa
  };

  // CHỌN THÊM FILE MỚI (Validate số lượng, dung lượng)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    const MAX_VIDEO_SIZE = 20 * 1024 * 1024;

    // Tổng số file (cũ đang hiển thị + mới đang chờ + mới vừa chọn) không quá 10
    if (oldImages.length + selectedFiles.length + filesArray.length > 10) {
      toast.warning('Tổng số lượng tài nguyên (cũ + mới) đính kèm tối đa là 10!');
      e.target.value = '';
      return;
    }

    const currentVideoCount = selectedFiles.filter(f => f.type.startsWith('video/')).length;
    let newVideoCount = 0;

    const validFiles: File[] = [];
    const newPreviews: { url: string; type: string }[] = [];

    for (const file of filesArray) {
      if (file.type.startsWith('image/')) {
        if (file.size > MAX_IMAGE_SIZE) {
          toast.error(`Ảnh [${file.name}] vượt quá 5MB!`);
          continue;
        }
        validFiles.push(file);
        newPreviews.push({ url: URL.createObjectURL(file), type: 'image' });
      } else if (file.type.startsWith('video/')) {
        newVideoCount++;
        if (currentVideoCount + newVideoCount > 1) {
          toast.warning('Hệ thống chỉ cho phép tải lên tối đa 1 video!');
          continue;
        }
        if (file.size > MAX_VIDEO_SIZE) {
          toast.error(`Video [${file.name}] vượt quá 20MB!`);
          continue;
        }
        validFiles.push(file);
        newPreviews.push({ url: URL.createObjectURL(file), type: 'video' });
      } else {
        toast.error(`File [${file.name}] không hợp lệ!`);
      }
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setPreviewItems(prev => [...prev, ...newPreviews]);
    }
    
    e.target.value = '';
  };

  // XÓA FILE MỚI ĐANG CHỜ TẢI LÊN
  const handleRemovePreview = (indexToRemove: number) => {
    URL.revokeObjectURL(previewItems[indexToRemove].url);
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviewItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = (data: any) => {
    // Ràng buộc phải có ít nhất 1 ảnh (hoặc ảnh cũ giữ lại, hoặc tải ảnh mới)
    if (oldImages.length === 0 && selectedFiles.length === 0) {
      toast.error('Tài sản phải có ít nhất 1 hình ảnh hoặc video!');
      return;
    }

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

    // Gửi mảng chứa ID các ảnh bị xóa để Backend xử lý
    if (deletedImageIds.length > 0) {
      formData.append('deletedImages', JSON.stringify(deletedImageIds));
    }

    // Đẩy các file MỚI vào
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });
    }

    const toastId = toast.loading('Đang đồng bộ dữ liệu...');

    fetch(`http://localhost:4000/bat-dong-san/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    })
      .then(async (response) => {
        if (response.ok) {
          // Thông báo và tự chuyển trang
          toast.update(toastId, { render: "Cập nhật thành công! Đang chuyển đến trang chi tiết...", type: "success", isLoading: false, autoClose: 1500 });
          
          setSelectedFiles([]);
          setPreviewItems([]);
          setDeletedImageIds([]);

          // Tự động nhảy sang trang Detail của chính SP này sau 1.5s
          setTimeout(() => {
            navigate(`/admin/bat-dong-san/detail/${id}`);
          }, 1500);

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
            
            {/* Hàng 1: Dropdown Khách Hàng Thông Minh */}
            <div className="form-group" style={{ position: 'relative' }} ref={suggestionRef}>
              <label>Khách hàng sở hữu (*)</label>
              <input 
                type="text" 
                placeholder=" Nhập thông tin tìm kiếm..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  setValue('khachHangId', '', { shouldValidate: true });
                }}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
              />
              <input type="hidden" {...register('khachHangId')} />
              
              {showSuggestions && searchTerm && (
                <ul style={{ 
                  position: 'absolute', top: '75px', left: 0, right: 0, 
                  backgroundColor: '#2d3436', border: '1px solid #636e72', 
                  borderRadius: '6px', maxHeight: '200px', overflowY: 'auto', 
                  zIndex: 100, padding: 0, margin: 0, listStyle: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                  {filteredKhachHang.length > 0 ? (
                    filteredKhachHang.map(kh => (
                      <li 
                        key={kh.id} 
                        style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #4a5459', color: '#fff', display: 'flex', justifyContent: 'space-between' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0984e3'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => {
                          setValue('khachHangId', kh.id, { shouldValidate: true });
                          setSearchTerm(`${kh.hoTen} - ${kh.soDienThoai}`);
                          setShowSuggestions(false);
                        }}
                      >
                        <span><strong>{kh.hoTen}</strong> ({kh.id})</span>
                        <span style={{ color: '#f1c40f' }}>{kh.soDienThoai}</span>
                      </li>
                    ))
                  ) : (
                    <li style={{ padding: '10px 15px', color: '#e74c3c' }}>Không tìm thấy khách hàng!</li>
                  )}
                </ul>
              )}
              {errors.khachHangId && <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '5px' }}>{errors.khachHangId.message}</span>}
            </div>

            <div className="form-group">
              <label>Tiêu đề tin đăng</label>
              <input type="text" {...register('tieuDe')} />
            </div>

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

            <div className="form-group full-width">
              <label>Địa chỉ chi tiết (*)</label>
              <input type="text" {...register('diaChi')} />
              {errors.diaChi && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.diaChi.message}</span>}
            </div>

            <div className="form-group full-width">
              <label>Ghi chú / Mô tả chi tiết</label>
              <textarea {...register('ghiChu')} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#13141f', color: '#fff', border: '1px solid #2d2e42' }}></textarea>
            </div>

            {/* VÙNG QUẢN LÝ ẢNH (ẢNH CŨ VÀ ẢNH MỚI) */}
            <div className="form-group full-width" style={{ backgroundColor: '#1e272e', padding: '15px', borderRadius: '8px' }}>
              <label>Quản lý Tài nguyên (Tối đa 10 file ảnh/video)</label>
              
              {/* Hiển thị Ảnh cũ từ DB */}
              {oldImages.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontSize: '13px', color: '#bdc3c7', margin: '0 0 10px 0' }}>Tài nguyên hiện tại (Có thể xóa bớt):</p>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {oldImages.map((img) => (
                      <div key={img.id} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #0984e3' }}>
                        <img src={img.duongDan} alt="Ảnh cũ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', bottom: '5px', left: '5px', backgroundColor: '#0984e3', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>ẢNH CŨ</span>
                        <button type="button" onClick={() => handleRemoveOldImage(img.id)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(231, 76, 60, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút Upload và Hiển thị File mới */}
              <div style={{ marginTop: '15px', borderTop: '1px dashed #636e72', paddingTop: '15px' }}>
                <p style={{ fontSize: '13px', color: '#bdc3c7', margin: '0 0 10px 0' }}>Tải thêm tài nguyên mới (Nếu cần):</p>
                <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} style={{ background: 'transparent', border: 'none' }} />
                
                {previewItems.length > 0 && (
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
                    {previewItems.map((item, index) => (
                      <div key={index} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '2px dashed #e67e22', backgroundColor: '#000' }}>
                        {item.type === 'image' ? (
                          <img src={item.url} alt={`Mới ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                        ) : (
                          <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                        )}
                        <span style={{ position: 'absolute', bottom: '5px', left: '5px', backgroundColor: '#e67e22', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>MỚI</span>
                        <button type="button" onClick={() => handleRemovePreview(index)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(231, 76, 60, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Quay lại</button>
            <button type="submit" className="btn-submit">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBatDongSan;