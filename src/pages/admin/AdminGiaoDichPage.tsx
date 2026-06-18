import { CrudPage } from '../../components/pages/CrudPage';

export function AdminGiaoDichPage() {
  return (
    <CrudPage 
      title="Giao dịch" 
      endpoint="/giao-dich" 
      columns={[
        // Dựa trên dữ liệu JSON bạn gửi, các key là:
        // 'ngayGiaoDich' -> Không thấy trong JSON
        // 'trangThai' -> Không thấy trong JSON
        // 'giaTri' -> Không thấy trong JSON
        
        // Hãy sử dụng các key có thật trong object JSON của bạn:
        { key: 'id', label: 'Mã GD' },
        { key: 'benMua', label: 'Bên mua' },
        { key: 'benBan', label: 'Bên bán' },
        { key: 'batDongSanId', label: 'Mã BĐS' }
      ]} 
    />
  );
}