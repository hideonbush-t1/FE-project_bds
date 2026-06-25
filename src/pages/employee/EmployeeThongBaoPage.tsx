import { CrudPage } from '../../components/pages/CrudPage';

export function EmployeeThongBaoPage() {
  return (
    <CrudPage 
      title="Thông báo nội bộ" 
      endpoint="/thong-bao" 
      columns={[
        { key: 'tieuDe', label: 'Tiêu đề' }, 
        { key: 'noiDung', label: 'Nội dung' }, 
        { key: 'ngayDang', label: 'Ngày đăng' }
      ]} 
    />
  );
}
