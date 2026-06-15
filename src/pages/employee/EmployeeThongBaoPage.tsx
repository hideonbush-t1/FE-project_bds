import { CrudPage } from '../../components/pages/CrudPage';

export function EmployeeThongBaoPage() {
  return <CrudPage title="Thông báo" endpoint="/thong-bao" columns={[{ key: 'tieuDe', label: 'Tiêu đề' }, { key: 'ngayDang', label: 'Ngày đăng' }]} />;
}