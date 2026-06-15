import { CrudPage } from '../../components/pages/CrudPage';

export function AdminDashboardPage() {
  return <CrudPage title="Dashboard" endpoint="/public/bat-dong-san" columns={[{ key: 'tieuDe', label: 'Tin đăng' }, { key: 'diaChi', label: 'Địa chỉ' }, { key: 'giaTien', label: 'Giá', money: true }]} />;
}