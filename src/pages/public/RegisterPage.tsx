import { FormEvent, useState } from 'react';
import { http } from '../../api/http';

export function RegisterPage() {
  const [status, setStatus] = useState<string>('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await http.post('/public/register', {
      hoTen: formData.get('hoTen'),
      email: formData.get('email'),
      soDienThoai: formData.get('soDienThoai'),
      diaChi: formData.get('diaChi'),
    });
    setStatus('Đăng ký thành công. Hệ thống đã lưu hồ sơ khách hàng.');
    event.currentTarget.reset();
  };

  return (
    <div className="public-page">
      <div className="panel">
        <h2 className="h4">Đăng ký</h2>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Họ tên</label>
            <input name="hoTen" className="form-control" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Số điện thoại</label>
            <input name="soDienThoai" className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Địa chỉ</label>
            <input name="diaChi" className="form-control" />
          </div>
          <div className="col-12 d-flex justify-content-end">
            <button className="btn btn-gold" type="submit">
              Gửi đăng ký
            </button>
          </div>
          {status ? <div className="col-12 text-success">{status}</div> : null}
        </form>
      </div>
    </div>
  );
}