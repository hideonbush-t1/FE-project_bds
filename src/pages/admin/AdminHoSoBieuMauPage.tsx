import { CrudPage } from '../../components/pages/CrudPage';

export function AdminHoSoBieuMauPage() {
  return <CrudPage title="Hồ sơ biểu mẫu" endpoint="/ho-so-bieu-mau" columns={[{ key: 'tenHoSo', label: 'Tên hồ sơ' }, { key: 'duongDan', label: 'Đường dẫn' }, { key: 'ngayTao', label: 'Ngày tạo' }]} />;
}