import { http } from '../../api/http';
import { useFetch } from '../../hooks/useFetch';
import { formatMoney } from '../../utils/money';

export function PublicDataPanel({
  title,
  endpoint,
}: {
  title: string;
  endpoint: string;
}) {
  const { data, loading, error } = useFetch(async () => {
    const response = await http.get(endpoint);
    return response.data as Array<Record<string, unknown>>;
  }, [endpoint]);

  return (
    <section className="panel public-page mb-4">
      <h2 className="h4">{title}</h2>
      {loading ? <div>Đang tải...</div> : null}
      {error ? <div className="text-danger">{error}</div> : null}
      {!loading && !error ? (
        <div className="row g-3">
          {(data ?? []).slice(0, 6).map((item: any) => (
            <div className="col-md-6 col-xl-4" key={String(item.id)}>
              <div className="panel h-100">
                <div className="fw-semibold mb-2">{String(item.tieuDe ?? item.tenHoSo ?? item.hoTen ?? 'Mục dữ liệu')}</div>
                <div className="muted small mb-1">{String(item.diaChi ?? item.noiDung ?? item.loaiBDS ?? '-')}</div>
                <div className="small">{formatMoney(item.giaTien ?? item.giaTri ?? null)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}