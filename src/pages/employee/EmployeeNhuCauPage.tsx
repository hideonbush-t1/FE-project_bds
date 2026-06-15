import { CrudPage } from '../../components/pages/CrudPage';

export function EmployeeNhuCauPage() {
  return <CrudPage title="Nhu cầu" endpoint="/nhu-cau" columns={[{ key: 'loaiNhuCau', label: 'Loại' }, { key: 'loaiBDS', label: 'Loại BĐS' }, { key: 'viTri', label: 'Vị trí' }]} />;
}