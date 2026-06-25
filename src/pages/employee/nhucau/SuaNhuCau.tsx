import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { http } from '../../../api/http';
import toast, { Toaster } from 'react-hot-toast';

export default function SuaNhuCau() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    khachHangId: '',
    loaiNC: 'Mua',
    loaiBDS: '',
    dienTichMin: '',
    dienTichMax: '',
    giaMin: '',
    giaMax: '',
    viTri: '',
    ghiChu: ''
  });

  useEffect(() => {
    const fetchNhuCau = async () => {
      try {
        const res = await http.get(`/nhu-cau/${id}`);
        const data = res.data;
        setFormData({
          khachHangId: data.khachHangId || '',
          loaiNC: data.loaiNC || 'Mua',
          loaiBDS: data.loaiBDS || '',
          dienTichMin: data.dienTichMin?.toString() || '',
          dienTichMax: data.dienTichMax?.toString() || '',
          giaMin: data.giaMin || '',
          giaMax: data.giaMax || '',
          viTri: data.viTri || '',
          ghiChu: data.ghiChu || ''
        });
      } catch (err) {
        toast.error("Không tìm thấy thông tin nhu cầu!");
      }
    };
    if (id) fetchNhuCau();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { id: _id, isDeleted, ...payload } = formData as any;
    const cleanPayload = {
      ...payload,
      dienTichMin: payload.dienTichMin ? Number(payload.dienTichMin) : undefined,
      dienTichMax: payload.dienTichMax ? Number(payload.dienTichMax) : undefined,
    };

    try {
      await http.patch(`/nhu-cau/${id}`, cleanPayload);
      toast.success('Cập nhật thành công!');
      setTimeout(() => navigate('/employee/nhu-cau'), 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' };

  return (
    <div style={{ padding: '40px', backgroundColor: '#1a1c23', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <Toaster />
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#252830', padding: '30px', borderRadius: '8px', color: '#fff' }}>
        <h2 style={{ color: '#f1c40f', textAlign: 'center' }}>✏️ CHỈNH SỬA NHU CẦU</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Mã Khách Hàng:</label>
            <input value={formData.khachHangId} onChange={(e) => setFormData({...formData, khachHangId: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>Loại Nhu Cầu:</label>
              <select value={formData.loaiNC} onChange={(e) => setFormData({...formData, loaiNC: e.target.value})} style={inputStyle}>
                <option value="Mua">Mua</option>
                <option value="Bán">Bán</option>
                <option value="Thuê">Thuê</option>
              </select>
            </div>
            <div>
              <label>Loại BĐS:</label>
              <input value={formData.loaiBDS} onChange={(e) => setFormData({...formData, loaiBDS: e.target.value})} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>Diện tích Min (m²):</label>
              <input type="number" value={formData.dienTichMin} onChange={(e) => setFormData({...formData, dienTichMin: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label>Diện tích Max (m²):</label>
              <input type="number" value={formData.dienTichMax} onChange={(e) => setFormData({...formData, dienTichMax: e.target.value})} style={inputStyle} />
            </div>
          </div>
          <div>
            <label>Vị trí:</label>
            <input value={formData.viTri} onChange={(e) => setFormData({...formData, viTri: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label>Ghi chú:</label>
            <textarea value={formData.ghiChu} onChange={(e) => setFormData({...formData, ghiChu: e.target.value})} style={{...inputStyle, height: '80px'}} />
          </div>

          {/* HÀNG NÚT BẤM */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 2, padding: '12px', background: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              LƯU THAY ĐỔI
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/employee/nhu-cau')} 
              style={{ flex: 1, padding: '12px', background: '#555', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}
            >
              QUAY LẠI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}