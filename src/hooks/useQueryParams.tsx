import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function useQueryParams() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getQueryParam = useCallback(
    (name: string) => {
      const value = searchParams.get(name);
      return value ?? undefined;
    },
    [searchParams]
  );

  const updateQueryParam = useCallback(
    (name: string, value: string | number | boolean) => {
      const query = new URLSearchParams(searchParams.toString());
      query.set(name, String(value));
      router.replace(`?${query.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const createQueryURL = useCallback(
    (name: string, value: string | number | boolean) => {
      const query = new URLSearchParams(searchParams.toString());
      query.set(name, String(value));
      return `?${query.toString()}`;
    },
    [searchParams]
  );

  return {
    getQueryParam,
    updateQueryParam,
    createQueryURL
  };
}
