import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function useQueryParams() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = useMemo(() => {
    const query = new URLSearchParams(searchParams.toString());
    return query;
  }, [searchParams]);

  const setQueryParam = (name: string, value: string | number | boolean) => {
    queryParam.set(String(name), String(value));
    router.replace(`?${queryParam}`, { scroll: false });
  };

  const getQueryParam = (name: string) => {
    const value = queryParam.get(String(name));
    if (value === null) return undefined;

    return value;
  };

  const createQueryString = (name: string, value: string | number | boolean) => {
    const query = new URLSearchParams(queryParam.toString());
    query.set(name, String(value));
    return `?${query.toString()}`;
  };

  return {
    queryParam,
    setQueryParam,
    getQueryParam,
    createQueryString
  };
}
