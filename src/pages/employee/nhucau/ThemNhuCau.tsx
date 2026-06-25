import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../../api/http';
import { toast } from 'react-toastify';

export default function ThemNhuCau() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    khachHangId: '',
    loaiNC: 'Mua',
    loaiBDS: '',
    dienTichMin: '',
    dienTichMax: '',
    viTri: '',
    ghiChu: ''
  });

  const inputStyle = { padding: '10px', backgroundColor: '#252830', border: '1px solid #444', color: '#fff', borderRadius: '4px' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      dienTichMin: formData.dienTichMin ? Number(formData.dienTichMin) : undefined,
      dienTichMax: formData.dienTichMax ? Number(formData.dienTichMax) : undefined,
    };

    try {
      await http.post('/nhu-cau', payload);
      toast.success("Thêm nhu cầu thành công!");
      navigate('/employee/nhu-cau');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm nhu cầu.");
    }
  };

  return (
    <div style={{ padding: '40px', color: '#fff', backgroundColor: '#1a1c23', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#252830', padding: '30px', borderRadius: '8px' }}>
        <h2 style={{ color: '#f1c40f', marginBottom: '20px' }}>➕ TẠO NHU CẦU MỚI</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            placeholder="Mã Khách Hàng (ID)" 
            onChange={(e) => setFormData({...formData, khachHangId: e.target.value})} 
            style={inputStyle} required 
          />
          
          <select 
            value={formData.loaiNC}
            onChange={(e) => setFormData({...formData, loaiNC: e.target.value})} 
            style={inputStyle}
          >
            <option value="Mua">Mua</option>
            <option value="Bán">Bán</option>
            <option value="Thuê">Thuê</option>
          </select>

          <input 
            placeholder="Loại Bất động sản" 
            onChange={(e) => setFormData({...formData, loaiBDS: e.target.value})} 
            style={inputStyle} 
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="number" placeholder="Diện tích Min (m²)" onChange={(e) => setFormData({...formData, dienTichMin: e.target.value})} style={inputStyle} />
            <input type="number" placeholder="Diện tích Max (m²)" onChange={(e) => setFormData({...formData, dienTichMax: e.target.value})} style={inputStyle} />
          </div>

          <input placeholder="Vị trí mong muốn" onChange={(e) => setFormData({...formData, viTri: e.target.value})} style={inputStyle} />
          
          <textarea placeholder="Ghi chú" onChange={(e) => setFormData({...formData, ghiChu: e.target.value})} style={{...inputStyle, height: '80px'}} />
          
          {/* PHẦN NÚT BẤM ĐÃ CẬP NHẬT */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              LƯU NHU CẦU
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/employee/nhu-cau')} 
              style={{ flex: 1, padding: '12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              HỦY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}