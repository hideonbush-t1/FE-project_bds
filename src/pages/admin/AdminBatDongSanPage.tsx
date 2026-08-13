import { CrudPage } from '../../components/pages/CrudPage';

export function AdminBatDongSanPage() {
  return <CrudPage title="Bất động sản" endpoint="/bat-dong-san" columns={[{ key: 'tieuDe', label: 'Tiêu đề' }, { key: 'loaiBDS', label: 'Loại' }, { key: 'diaChi', label: 'Địa chỉ' }, { key: 'giaTien', label: 'Giá', money: true }]} />;
}