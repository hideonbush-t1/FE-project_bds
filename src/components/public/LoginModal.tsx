import { FormEvent, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function LoginModal({ onClose }: { onClose: () => void }) {
  const { login } = useAuth();
  const [maNV, setMaNV] = useState('admin');
  const [matKhau, setMatKhau] = useState('123456');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await login(maNV, matKhau);
      onClose();
    } catch {
      setError('Đăng nhập thất bại');
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-modal-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-0">Đăng nhập</h2>
          <button className="btn-close" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="stack-gap">
          <label className="form-label">Mã nhân viên</label>
          <input className="form-control" value={maNV} onChange={(event) => setMaNV(event.target.value)} />
          <label className="form-label">Mật khẩu</label>
          <input
            type="password"
            className="form-control"
            value={matKhau}
            onChange={(event) => setMatKhau(event.target.value)}
          />
          {error ? <div className="text-danger small">{error}</div> : null}
          <div className="d-flex gap-2 justify-content-end mt-3">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-gold">
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}