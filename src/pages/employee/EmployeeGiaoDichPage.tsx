import { CrudPage } from '../../components/pages/CrudPage';

export function EmployeeGiaoDichPage() {
  return (
    <CrudPage 
      title="Giao dịch" 
      endpoint="/giao-dich" 
      columns={[
        // Cập nhật key khớp với dữ liệu JSON thực tế
        { key: 'id', label: 'Mã GD' },
        { key: 'nhanVienId', label: 'Mã NV' },
        { key: 'benMua', label: 'Bên mua' },
        { key: 'benBan', label: 'Bên bán' },
        { key: 'batDongSanId', label: 'Mã BĐS' }
        // Lưu ý: Nếu trong JSON có các field như soTien, ngayGd... 
        // bạn hãy thêm vào đây với key tương ứng
      ]} 
    />
  );
}