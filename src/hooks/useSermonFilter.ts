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
  // 적용된 필터 수 — 모바일 ToolbarFilterButton 배지 등 UI 카운터용. sort는 'recent' 기본값이 아닐 때만 카운트
  const activeFilterCount =
    (series ? 1 : 0) +
    (preacher ? 1 : 0) +
    (q.trim() ? 1 : 0) +
    (year ? 1 : 0) +
    (sort !== 'recent' ? 1 : 0);

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

  // page/sort는 기본값으로 자동 리셋하되, patch가 명시한 키는 그 값을 우선
  // - page: 잔류 page가 totalPages 초과해 빈 결과 노출되는 버그 차단
  // - sort: 필터 변경 시 정렬 의도가 새 결과 셋에 종속되므로 기본('recent')으로 회귀
  const setFilter = useCallback(
    (patch: SermonFilterPatch) =>
      updateParams({ page: null, sort: null, ...patch }),
    [updateParams]
  );

  const setSort = useCallback(
    (value: SermonSortKey) =>
      updateParams({ sort: value === 'recent' ? null : value, page: null }),
    [updateParams]
  );

  return {
    series,
    preacher,
    q,
    year,
    sort,
    isActive,
    activeFilterCount,
    setFilter,
    setSort
  };
}
