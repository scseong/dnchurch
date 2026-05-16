'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SERIES_FILTER_KEYS, type SeriesFilterPatch } from '@/utils/sermon';

export default function useSeriesFilter() {
  const router = useRouter();
  const sp = useSearchParams();

  const [statusKey, yearKey, qKey] = SERIES_FILTER_KEYS;

  const status = sp.get(statusKey);
  const year = sp.get(yearKey);
  const q = sp.get(qKey) ?? '';
  const isActive = !!(status || year || q);
  const activeFilterCount =
    (status ? 1 : 0) + (year ? 1 : 0) + (q.trim() ? 1 : 0);

  const setFilter = useCallback(
    (patch: SeriesFilterPatch) => {
      const next = new URLSearchParams(sp);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) continue;
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.push(`/sermons/series${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, sp]
  );

  return { status, year, q, isActive, activeFilterCount, setFilter };
}
