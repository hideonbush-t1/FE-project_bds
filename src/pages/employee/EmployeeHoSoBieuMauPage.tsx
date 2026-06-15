import { CrudPage } from '../../components/pages/CrudPage';

export function EmployeeHoSoBieuMauPage() {
  return <CrudPage title="Biểu mẫu" endpoint="/ho-so-bieu-mau" columns={[{ key: 'tenHoSo', label: 'Tên hồ sơ' }, { key: 'duongDan', label: 'Đường dẫn' }, { key: 'ngayTao', label: 'Ngày tạo' }]} />;
}