import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { http } from '../../../../api/http';
import { toast } from 'react-toastify';

export default function DanhSachBDS() {
  const [bdsList, setBdsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Hook để quay lại
  
  const loaiBDS = searchParams.get('loaiBDS') || '';
  const viTri = searchParams.get('viTri') || '';

  const fetchBDS = async () => {
    setLoading(true);
    try {
      const res = await http.get('/bat-dong-san/filter', { 
        params: { loaiBDS, viTri } 
      });
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setBdsList(data);
    } catch (error) {
      toast.error("Không thể tải danh sách BĐS!");
      setBdsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBDS();
  }, [loaiBDS, viTri]);

  return (
    <div style={{ padding: '40px', backgroundColor: '#1a1c23', color: '#fff', minHeight: '100vh' }}>
      {/* NÚT QUAY LẠI */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          padding: '8px 16px', 
          marginBottom: '20px', 
          backgroundColor: '#444', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
      >
        ← Quay lại
      </button>

      <h2 style={{ marginBottom: '20px' }}>📋 DANH SÁCH BẤT ĐỘNG SẢN PHÙ HỢP</h2>
      
      {/* THÔNG TIN LỌC */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#333', borderRadius: '4px' }}>
        Kết quả lọc cho: <b>{loaiBDS || 'Tất cả loại hình'}</b> tại <b>{viTri || 'Mọi khu vực'}</b>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#252830', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#333', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Mã BĐS</th>
            <th style={{ padding: '12px' }}>Loại BĐS</th>
            <th style={{ padding: '12px' }}>Địa chỉ</th>
            <th style={{ padding: '12px' }}>Diện tích</th>
            <th style={{ padding: '12px' }}>Giá tiền</th>
            <th style={{ padding: '12px' }}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</td></tr>
          ) : bdsList.length > 0 ? (
            bdsList.map((bds: any) => (
              <tr key={bds.id} style={{ borderBottom: '1px solid #444' }}>
                <td style={{ padding: '12px' }}>{bds.id}</td>
                <td style={{ padding: '12px' }}>{bds.loaiBDS}</td>
                <td style={{ padding: '12px' }}>{bds.diaChi || '—'}</td>
                <td style={{ padding: '12px' }}>{bds.dienTich ? `${bds.dienTich} m²` : '—'}</td>
                <td style={{ padding: '12px' }}>
                  {bds.giaTien ? `${parseFloat(bds.giaTien.toString()).toLocaleString()} tỷ` : '—'}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    background: bds.tinhTrang === 'Đang bán' ? '#2e7d32' : '#d32f2f' 
                  }}>
                    {bds.tinhTrang}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>
                Không tìm thấy bất động sản nào phù hợp với yêu cầu này.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}