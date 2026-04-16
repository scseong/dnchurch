'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SERMON_FILTER_KEYS, type SermonFilterPatch } from '@/utils/sermon';

export default function useSermonFilter() {
  const router = useRouter();
  const sp = useSearchParams();

  const [seriesKey, preacherKey, qKey, yearKey] = SERMON_FILTER_KEYS;

  const series = sp.get(seriesKey);
  const preacher = sp.get(preacherKey);
  const q = sp.get(qKey) ?? '';
  const year = sp.get(yearKey);
  const isActive = !!(series || preacher || q || year);

  const setFilter = useCallback(
    (patch: SermonFilterPatch) => {
      const next = new URLSearchParams(sp);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) continue;
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.push(`/sermons${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, sp]
  );

  return { series, preacher, q, year, isActive, setFilter };
}
