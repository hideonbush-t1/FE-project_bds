import { CrudPage } from '../../components/pages/CrudPage';

export function EmployeeBatDongSanPage() {
  return <CrudPage title="Bất động sản" endpoint="/bat-dong-san" columns={[{ key: 'tieuDe', label: 'Tiêu đề' }, { key: 'loaiBDS', label: 'Loại' }, { key: 'diaChi', label: 'Địa chỉ' }, { key: 'giaTien', label: 'Giá', money: true }]} />;
}