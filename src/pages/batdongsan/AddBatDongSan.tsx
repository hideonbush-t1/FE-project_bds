import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Schema xác thực dữ liệu chuẩn theo Prisma
const schema = yup.object().shape({
  khachHangId: yup.string().required('Vui lòng chọn khách hàng sở hữu'),
  loaiBDS: yup.string().required('Vui lòng chọn loại BĐS'),
  diaChi: yup.string().required('Địa chỉ không được để trống'),
  dienTich: yup.number().typeError('Diện tích phải là số').positive('Diện tích > 0').required('Vui lòng nhập diện tích'),
  giaTien: yup.number().typeError('Giá tiền phải là số').positive('Giá > 0').required('Vui lòng nhập giá tiền'),
  tinhTrang: yup.string().required('Vui lòng chọn tình trạng'),
  
  // Các trường tùy chọn (Optional)
  tieuDe: yup.string().nullable(),
  nhuCau: yup.string().nullable(),
  viTri: yup.string().nullable(),
  huong: yup.string().nullable(),
  ghiChu: yup.string().nullable(),
});

const AddBatDongSan = () => {
  const navigate = useNavigate();
  const [khachHangList, setKhachHangList] = useState<any[]>([]);
  
  // State quản lý việc tìm kiếm khách hàng dạng gợi ý tự động (Giống Google)
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // State quản lý mảng file thực tế và URL preview hiển thị trên giao diện
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewItems, setPreviewItems] = useState<{ url: string; type: string }[]>([]);
  
  const token = localStorage.getItem('accessToken') || '';

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      loaiBDS: 'Nhà ở',
      nhuCau: 'Bán',
      tinhTrang: 'Đang bán',
    }
  });

  // Tải danh sách khách hàng từ hệ thống
  useEffect(() => {
    fetch('http://localhost:4000/khach-hang', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setKhachHangList(data); })
      .catch(() => toast.error('Lỗi khi tải danh sách Khách hàng!'));
  }, [token]);

  // Đóng dropdown tìm kiếm khi nhấn chuột ra ngoài vùng lựa chọn
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
// Bộ lọc khách hàng linh hoạt: Tìm theo Tên, Mã ID, hoặc Số điện thoại
  const filteredKhachHang = khachHangList.filter(kh =>
    kh.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kh.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (kh.soDienThoai && kh.soDienThoai.includes(searchTerm))
  );

  // Xử lý sự kiện chọn tệp tin (Ảnh + Video), validate ràng buộc dung lượng/số lượng
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

    // 1. Kiểm tra tổng số lượng file tối đa là 10
    if (selectedFiles.length + filesArray.length > 10) {
      toast.warning('Tổng số lượng ảnh và video đính kèm không được vượt quá 10 file!');
      e.target.value = '';
      return;
    }

    const currentVideoCount = selectedFiles.filter(f => f.type.startsWith('video/')).length;
    let newVideoCount = 0;

    const validFiles: File[] = [];
    const newPreviews: { url: string; type: string }[] = [];

    for (const file of filesArray) {
      if (file.type.startsWith('image/')) {
        // Kiểm tra kích thước ảnh
        if (file.size > MAX_IMAGE_SIZE) {
          toast.error(`Ảnh [${file.name}] vượt quá dung lượng cho phép (Tối đa 5MB)`);
          continue;
        }
        validFiles.push(file);
        newPreviews.push({ url: URL.createObjectURL(file), type: 'image' });
      } else if (file.type.startsWith('video/')) {
        newVideoCount++;
        // Kiểm tra giới hạn số lượng video (Tối đa 1 video)
        if (currentVideoCount + newVideoCount > 1) {
          toast.warning('Mỗi bài đăng bất động sản chỉ được phép đính kèm tối đa 1 video!');
          continue;
        }
        // Kiểm tra kích thước video
        if (file.size > MAX_VIDEO_SIZE) {
          toast.error(`Video [${file.name}] vượt quá dung lượng cho phép (Tối đa 20MB)`);
          continue;
        }
        validFiles.push(file);
        newPreviews.push({ url: URL.createObjectURL(file), type: 'video' });
      } else {
        toast.error(`Tệp [${file.name}] không đúng định dạng hình ảnh hoặc video thích hợp!`);
      }
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setPreviewItems(prev => [...prev, ...newPreviews]);
    }
    
    e.target.value = '';
  };

  // Loại bỏ file khỏi danh sách xem trước
  const handleRemovePreview = (indexToRemove: number) => {
    // Thu hồi URL tạm thời để tránh rò rỉ bộ nhớ
    URL.revokeObjectURL(previewItems[indexToRemove].url);
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviewItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = (data: any) => {
if (selectedFiles.length === 0) {
      toast.error('Vui lòng cấu hình ít nhất 1 hình ảnh hoặc video cho bất động sản!');
      return;
    }

    const formData = new FormData();
    
    // Nạp dữ liệu bắt buộc vào đối tượng FormData
    formData.append('khachHangId', String(data.khachHangId));
    formData.append('loaiBDS', String(data.loaiBDS));
    formData.append('diaChi', String(data.diaChi));
    formData.append('dienTich', String(data.dienTich)); 
    formData.append('giaTien', String(data.giaTien));
    formData.append('tinhTrang', String(data.tinhTrang));

    // Nạp dữ liệu tùy chọn nếu có
    if (data.tieuDe) formData.append('tieuDe', String(data.tieuDe));
    if (data.nhuCau) formData.append('nhuCau', String(data.nhuCau));
    if (data.viTri) formData.append('viTri', String(data.viTri));
    if (data.huong) formData.append('huong', String(data.huong));
    if (data.ghiChu) formData.append('ghiChu', String(data.ghiChu));

    // Đẩy mảng file nhị phân vào trường dữ liệu hình ảnh
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    const toastId = toast.loading('Đang tiến hành đồng bộ và tải dữ liệu lên hệ thống Cloudinary...');

    fetch('http://localhost:4000/bat-dong-san', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    })
      .then(async (response) => {
        if (response.ok) {
          toast.update(toastId, { render: "Thêm mới bất động sản thành công!", type: "success", isLoading: false, autoClose: 1500 });
          setSelectedFiles([]);
          setPreviewItems([]);
          setSearchTerm('');
          reset();
          
          // ĐÃ THÊM: Chờ 1.5 giây để người dùng đọc thông báo xong rồi tự động đá về trang Danh sách
          setTimeout(() => {
            navigate('/admin/bat-dong-san');
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
        <h2>Thêm Bất động sản mới</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            
            {/* Bộ Tìm Kiếm Khách Hàng Thông Minh (Auto-suggest) */}
            <div className="form-group" style={{ position: 'relative' }} ref={suggestionRef}>
              <label>Khách hàng sở hữu (*) (Tìm theo Tên, Mã, hoặc SĐT)</label>
<input 
                type="text" 
                placeholder=" Nhập thông tin để tìm kiếm khách hàng..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  setValue('khachHangId', '', { shouldValidate: true });
                }}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
              />
              {/* Lưu mã khách hàng ngầm để kiểm tra dữ liệu qua hook form */}
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
                    <li style={{ padding: '10px 15px', color: '#e74c3c' }}>Không tìm thấy khách hàng nào khớp với từ khóa</li>
                  )}
                </ul>
              )}
              {errors.khachHangId && <span style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '5px' }}>{errors.khachHangId.message}</span>}
            </div>

            <div className="form-group">
              <label>Tiêu đề tin đăng</label>
              <input type="text" {...register('tieuDe')} placeholder="Nhập tiêu đề tin đăng (nếu có)" />
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
              <input type="text" {...register('viTri')} placeholder="VD: Mặt tiền đường 12m" />
            </div>

            <div className="form-group full-width">
              <label>Địa chỉ chi tiết (*)</label>
              <input type="text" {...register('diaChi')} placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." />
              {errors.diaChi && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.diaChi.message}</span>}
            </div>

            <div className="form-group full-width">
              <label>Ghi chú / Mô tả chi tiết</label>
              <textarea {...register('ghiChu')} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#13141f', color: '#fff', border: '1px solid #2d2e42' }} placeholder="Nhập thông tin mô tả chi tiết công trình, nội thất hoặc pháp lý kèm theo..."></textarea>
            </div>
{/* Vùng chọn đa file và hiển thị Preview lưới */}
            <div className="form-group full-width">
              <label>Tải lên Tài nguyên BĐS (* Tối đa 10 file. Gồm nhiều ảnh &lt; 5MB và tối đa 1 video &lt; 20MB)</label>
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*" 
                onChange={handleFileChange} 
                style={{ background: 'transparent', border: 'none' }} 
              />
              
              {previewItems.length > 0 && (
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
                  {previewItems.map((item, index) => (
                    <div key={index} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2d3436', backgroundColor: '#000' }}>
                      {item.type === 'image' ? (
                        <img src={item.url} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <video src={item.url} controls={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      
                      {/* Huy hiệu nhỏ hiển thị loại tài nguyên trực quan */}
                      <span style={{ position: 'absolute', bottom: '5px', left: '5px', backgroundColor: item.type === 'image' ? '#2ecc71' : '#e67e22', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {item.type === 'image' ? 'ẢNH' : 'VIDEO'}
                      </span>

                      <button 
                        type="button" 
                        onClick={() => handleRemovePreview(index)}
                        style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(231, 76, 60, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Hủy bỏ</button>
            <button type="submit" className="btn-submit">Lưu lại hệ thống</button>
</div>
        </form>
      </div>
    </div>
  );
};

export default AddBatDongSan;