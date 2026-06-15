import { useAuth } from '../../contexts/AuthContext';

export function AdminProfilePage() {
  const { user } = useAuth();

  return (
    <div className="panel">
      <h2 className="h4">Hồ sơ</h2>
      <p>Họ tên: {user?.hoTen}</p>
      <p>Mã NV: {user?.maNV}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}