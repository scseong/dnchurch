import { NextCacheOptions } from '@/types/common';

export const createFetch = ({ cache, tags, revalidate }: NextCacheOptions = {}) => {
  return (url: RequestInfo | URL, init?: RequestInit) => {
    const next =
      tags || revalidate ? { tags: tags ?? [], revalidate: revalidate ?? false } : undefined;

    return fetch(url, {
      ...init,
      ...(cache ? { cache } : {}),
      ...(next ? { next } : {})
    });
  };
};
