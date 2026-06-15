import { useEffect, useState } from 'react';

export function useFetch<T>(factory: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    factory()
      .then((result) => mounted && setData(result))
      .catch(() => mounted && setError('Không tải được dữ liệu'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, deps);

  return { data, loading, error };
}