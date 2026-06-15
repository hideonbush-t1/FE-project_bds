import { useAuth } from '../../contexts/AuthContext';

export function EmployeeProfilePage() {
  const { user } = useAuth();

  return (
    <div className="panel">
      <h2 className="h4">Hồ sơ nhân viên</h2>
      <p>Họ tên: {user?.hoTen}</p>
      <p>Mã NV: {user?.maNV}</p>
      <p>Chức vụ: {user?.chucVu}</p>
    </div>
  );
}