import { useEffect, useState } from 'react';

interface UseApiParams {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string;
  headers?: HeadersInit;
  token?: string;
}

interface UseApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
const useLmnFetch = <T>({
  url,
  method = 'GET',
  body = '',
  headers = {},
  token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyIjoibmV0emludC10ZWFjaGVyIiwicm9sZSI6InRlYWNoZXIifQ.F-P2ZUkkSGgXRL_tPaRLup-37pVgOO1Wnb-4O1T42SPat7fCdh4Cgl6pI-bZCnqXbPAmwkTGlrMjuxje64yI8g',
}: UseApiParams): UseApiResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('token', token);
        const authHeaders = token ? { ...headers, 'X-Api-Key': token } : headers;
        const response = await fetch(url, {
          method,
          headers: authHeaders,
          body: method !== 'GET' && body ? JSON.stringify(body) : null,
        });
        if (!response.ok) throw new Error('Network response was not ok');
        await response.json().then((resp) => {
          setData(resp as T);
        });
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setLoading(false);
      }
    };
    fetchData().catch(console.error);
  }, [url, method, body, headers, token]);

  return { data, loading, error };
};

export default useLmnFetch;
