import { NextCacheOptions } from '@/shared/supabase/types';

export const createFetch = ({ cache, tags, revalidate }: NextCacheOptions = {}) => {
  return (url: RequestInfo | URL, init?: RequestInit) => {
    const next = tags || revalidate ? { tags: tags ?? [], revalidate: revalidate ?? 0 } : undefined;

    return fetch(url, {
      ...init,
      ...(cache ? { cache } : {}),
      ...(next ? { next } : {})
    });
  };
};
