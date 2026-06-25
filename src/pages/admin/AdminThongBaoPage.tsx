import { useState } from 'react';
import { http } from '../../api/http';
import { useFetch } from '../../hooks/useFetch';

export function AdminThongBaoPage() {
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Lấy danh sách thông báo
  const { data, loading, error } = useFetch(async () => {
    const response = await http.get('/thong-bao');
    return response.data as Array<any>;
  }, ['/thong-bao']);

  // Xử lý Thêm mới & Cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      if (editingId) {
        await http.patch(`/thong-bao/${editingId}`, { tieuDe, noiDung });
        setMessage('Cập nhật thông báo thành công!');
      } else {
        await http.post('/thong-bao', { tieuDe, noiDung });
        setMessage('Tạo thông báo thành công!');
      }
      
      setTieuDe('');
      setNoiDung('');
      setEditingId(null);
      setTimeout(() => { window.location.reload(); }, 1000);
      
    } catch (error: any) {
      console.error(error);
      setMessage('Có lỗi xảy ra: ' + (error.response?.data?.message || 'Lỗi hệ thống'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Đưa dữ liệu lên Form để Sửa
  const handleEdit = (thongBao: any) => {
    setTieuDe(thongBao.tieuDe);
    setNoiDung(thongBao.noiDung);
    setEditingId(thongBao.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xử lý Xóa
  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này không?')) return;
    
    try {
      await http.delete(`/thong-bao/${id}`);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi xóa!');
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div className="eyebrow">Quản trị</div>
        <h2 className="h3 mb-0">Quản lý Thông báo</h2>
      </div>

      <div className="panel mb-4 p-4">
        <h3 className="h5 mb-3">{editingId ? 'Sửa Thông Báo' : 'Tạo Thông Báo Mới'}</h3>
        
        {message && (
          <div className={`mb-3 p-2 rounded ${message.includes('thành công') ? 'bg-success text-white' : 'bg-danger text-white'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tiêu đề</label>
            <input 
              type="text" 
              className="form-control" 
              value={tieuDe} 
              onChange={(e) => setTieuDe(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nội dung</label>
            <textarea 
              className="form-control" 
              rows={3} 
              value={noiDung} 
              onChange={(e) => setNoiDung(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-warning" disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : (editingId ? 'Cập Nhật' : 'Gửi Thông Báo')}
          </button>

          {editingId && (
            <button 
              type="button" 
              className="btn btn-secondary ms-2" 
              onClick={() => { setEditingId(null); setTieuDe(''); setNoiDung(''); }}
            >
              Hủy
            </button>
          )}
        </form>
      </div>

      <div className="panel">
        {loading && <div className="p-4">Đang tải...</div>}
        {error && <div className="p-4 text-danger">{error}</div>}
        
        {!loading && !error && (
          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Nội dung</th>
                  <th>Ngày đăng</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((row: any) => (
                  <tr key={row.id}>
                    <td>{row.tieuDe}</td>
                    <td>{row.noiDung}</td>
                    <td>{new Date(row.ngayDang).toLocaleDateString('vi-VN')}</td>
                    <td className="text-center">
                      <button 
                        className="btn btn-sm btn-outline-primary me-2" 
                        onClick={() => handleEdit(row)}
                      >
                        Sửa
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(row.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}