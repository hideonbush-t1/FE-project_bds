import { CrudPage } from '../../components/pages/CrudPage';

export function AdminKhachHangPage() {
  return <CrudPage title="Khách hàng" endpoint="/khach-hang" columns={[{ key: 'maKH', label: 'Mã KH' }, { key: 'hoTen', label: 'Họ tên' }, { key: 'loaiKH', label: 'Loại' }, { key: 'email', label: 'Email' }]} />;
}