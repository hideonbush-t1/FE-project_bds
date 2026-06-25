import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { http } from '../../../api/http';
import { toast } from 'react-toastify';

export default function ChiTietNhuCau() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tự động nhận diện đường dẫn để quay lại cho đúng
  const isRouteAdmin = location.pathname.includes('/admin');
  const backUrl = isRouteAdmin ? '/admin/nhu-cau' : '/employee/nhu-cau';

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        setError('ID nhu cầu không hợp lệ.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const res = await http.get(`/nhu-cau/${id}`);
        setData(res.data);
      } catch (err: any) {
        console.error(err);
        setError('Không thể tải chi tiết nhu cầu.');
        toast.error("Lỗi khi tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>⏳ Đang tải...</div>;
  if (error) return <div style={{ padding: '40px', color: '#e74c3c', textAlign: 'center' }}>❌ {error}</div>;
  if (!data) return <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>Không tìm thấy dữ liệu.</div>;

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#1a1c23', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#252830', padding: '30px', borderRadius: '8px', border: '1px solid #3d4149', color: '#fff' }}>
        <h2 style={{ color: '#f1c40f', borderBottom: '2px solid #333', paddingBottom: '10px', textAlign: 'center', marginBottom: '25px' }}>
          🔍 CHI TIẾT NHU CẦU
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[
            { label: 'Mã Nhu Cầu', value: data.id },
            { label: 'Mã Khách Hàng', value: data.khachHangId },
            { label: 'Loại', value: data.loaiNC },
            { label: 'Loại BĐS', value: data.loaiBDS },
            { label: 'Diện tích', value: `${data.dienTichMin || 0} - ${data.dienTichMax || 0} m²` },
            { label: 'Giá', value: `${data.giaMin || 0} - ${data.giaMax || 0} tỷ` },
            { label: 'Vị trí', value: data.viTri },
            { label: 'Ghi chú', value: data.ghiChu || 'Không có ghi chú' }
          ].map((item, index) => (
            <div key={index} style={{ display: 'flex', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              <strong style={{ width: '160px', color: '#bdc3c7' }}>{item.label}:</strong>
              <span style={{ color: '#fff', wordBreak: 'break-word' }}>{item.value}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate(backUrl)} 
          style={{ 
            marginTop: '30px', 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#333', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: '0.3s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#444')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#333')}
        >
          ⬅ QUAY LẠI DANH SÁCH
        </button>
      </div>
    </div>
  );
}