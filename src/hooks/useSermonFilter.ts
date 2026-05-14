'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SERMON_FILTER_KEYS, type SermonFilterPatch } from '@/utils/sermon';
import type { SermonSortKey } from '@/types/sermon';

export default function useSermonFilter() {
  const router = useRouter();
  const sp = useSearchParams();

  const [seriesKey, preacherKey, qKey, yearKey] = SERMON_FILTER_KEYS;

  const series = sp.get(seriesKey);
  const preacher = sp.get(preacherKey);
  const q = sp.get(qKey) ?? '';
  const year = sp.get(yearKey);
  const rawSort = sp.get('sort');
  const sort: SermonSortKey = rawSort === 'oldest' ? 'oldest' : 'recent';
  const isActive = !!(series || preacher || q || year);

  const updateParams = useCallback(
    (patch: Record<string, string | null | undefined>) => {
      const next = new URLSearchParams(sp);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) continue;
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.push(`/sermons/all${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, sp]
  );

  // 필터/정렬 변경 시 page 자동 리셋 — 잔류 page가 totalPages 초과해 빈 결과 노출되는 버그 차단
  const setFilter = useCallback(
    (patch: SermonFilterPatch) => updateParams({ ...patch, page: null }),
    [updateParams]
  );

  const setSort = useCallback(
    (value: SermonSortKey) =>
      updateParams({ sort: value === 'recent' ? null : value, page: null }),
    [updateParams]
  );

  return { series, preacher, q, year, sort, isActive, setFilter, setSort };
}
