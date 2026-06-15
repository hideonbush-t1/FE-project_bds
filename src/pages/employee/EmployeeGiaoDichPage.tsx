import { CrudPage } from '../../components/pages/CrudPage';

export function EmployeeGiaoDichPage() {
  return <CrudPage title="Giao dịch" endpoint="/giao-dich" columns={[{ key: 'ngayGiaoDich', label: 'Ngày' }, { key: 'trangThai', label: 'Trạng thái' }, { key: 'giaTri', label: 'Giá trị', money: true }]} />;
}