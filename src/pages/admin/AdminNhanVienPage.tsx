import { CrudPage } from '../../components/pages/CrudPage';

export function AdminNhanVienPage() {
  return <CrudPage title="Nhân viên" endpoint="/nhan-vien" columns={[{ key: 'maNV', label: 'Mã NV' }, { key: 'hoTen', label: 'Họ tên' }, { key: 'email', label: 'Email' }, { key: 'chucVu', label: 'Chức vụ' }]} />;
}