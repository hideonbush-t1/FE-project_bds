import { http } from '../../api/http';
import { useFetch } from '../../hooks/useFetch';
import { formatMoney } from '../../utils/money';

type Column = {
  key: string;
  label: string;
  money?: boolean;
};

export function CrudPage({ title, endpoint, columns }: { title: string; endpoint: string; columns: Column[] }) {
  const { data, loading, error } = useFetch(async () => {
    const response = await http.get(endpoint);
    return response.data as Array<Record<string, unknown>>;
  }, [endpoint]);

  return (
    <div>
      <div className="page-heading">
        <div className="eyebrow">Quản trị</div>
        <h2 className="h3 mb-0">{title}</h2>
      </div>
      <div className="panel">
        {loading ? <div className="p-4">Đang tải...</div> : null}
        {error ? <div className="p-4 text-danger">{error}</div> : null}
        {!loading && !error ? (
          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((row, index) => (
                  <tr key={String(row.id ?? row.MaHoSo ?? index)}>
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.money
                          ? formatMoney(row[column.key] as string | number | null)
                          : String(row[column.key] ?? row[column.key.charAt(0).toUpperCase() + column.key.slice(1)] ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}