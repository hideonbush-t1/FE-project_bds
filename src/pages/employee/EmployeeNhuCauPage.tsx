import { CrudPage } from '../../components/pages/CrudPage';

export function EmployeeNhuCauPage() {
  return (
    <CrudPage 
      title="Quản lý nhu cầu khách hàng" 
      endpoint="/nhu-cau" 
      columns={[
        { key: 'id', label: 'Mã NC' },
        { key: 'khachHangId', label: 'Mã KH' },
        { key: 'loaiNC', label: 'Loại Nhu Cầu' },
        { key: 'loaiBDS', label: 'Loại BĐS' },
        { key: 'viTri', label: 'Vị trí' },
        // Thay vì dùng render (bị lỗi), ta chia làm 2 cột hoặc hiển thị riêng biệt
        { key: 'dienTichMin', label: 'Diện tích Min (m²)' },
        { key: 'dienTichMax', label: 'Diện tích Max (m²)' },
        { key: 'ghiChu', label: 'Ghi chú' }
      ]} 
    />
  );
}