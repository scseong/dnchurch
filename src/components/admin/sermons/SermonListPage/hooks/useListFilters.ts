'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  AdminSermonListParams,
  AdminSermonSortKey,
  SermonStatusTab
} from '@/types/sermon';
import {
  buildListFilterQuery,
  parseListFilterParams
} from './list-filter-params';

export function useListFilters(initial?: AdminSermonListParams) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AdminSermonListParams>(
    () =>
      initial ?? parseListFilterParams(new URLSearchParams(searchParams.toString()))
  );

  // URL 변경(뒤로가기/수동 입력) → state
  useEffect(() => {
    const fromUrl = parseListFilterParams(new URLSearchParams(searchParams.toString()));
    setState((current) =>
      buildListFilterQuery(current) === buildListFilterQuery(fromUrl) ? current : fromUrl
    );
  }, [searchParams]);

  // state → URL: server segment 재실행 동안 isPending=true
  useEffect(() => {
    const target = buildListFilterQuery(state);
    if (target === searchParams.toString()) return;
    startTransition(() => {
      router.replace(target ? `?${target}` : '?', { scroll: false });
    });
  }, [state, searchParams, router]);

  const setStatusTab = useCallback(
    (value: SermonStatusTab) =>
      setState((current) => ({ ...current, statusTab: value, page: 1 })),
    []
  );

  const setSearch = useCallback(
    (value: string) => setState((current) => ({ ...current, search: value, page: 1 })),
    []
  );

  const togglePreacher = useCallback(
    (id: string) =>
      setState((current) => ({
        ...current,
        selectedPreachers: current.selectedPreachers.includes(id)
          ? current.selectedPreachers.filter((value) => value !== id)
          : [...current.selectedPreachers, id],
        page: 1
      })),
    []
  );

  const toggleSeries = useCallback(
    (id: string) =>
      setState((current) => ({
        ...current,
        selectedSeries: current.selectedSeries.includes(id)
          ? current.selectedSeries.filter((value) => value !== id)
          : [...current.selectedSeries, id],
        page: 1
      })),
    []
  );

  const setDateRange = useCallback(
    ({ from, to }: { from: string; to: string }) =>
      setState((current) => ({ ...current, dateFrom: from, dateTo: to, page: 1 })),
    []
  );

  const clearDate = useCallback(
    () => setState((current) => ({ ...current, dateFrom: '', dateTo: '', page: 1 })),
    []
  );

  const clearAll = useCallback(
    () =>
      setState((current) => ({
        ...current,
        search: '',
        selectedPreachers: [],
        selectedSeries: [],
        dateFrom: '',
        dateTo: '',
        page: 1
      })),
    []
  );

  const handleSortChange = useCallback(
    (key: AdminSermonSortKey) =>
      setState((current) => {
        const next = current.sort;
        if (next?.key !== key) return { ...current, sort: { key, direction: 'asc' } };
        if (next.direction === 'asc') return { ...current, sort: { key, direction: 'desc' } };
        return { ...current, sort: null };
      }),
    []
  );

  const setPage = useCallback(
    (value: number) => setState((current) => ({ ...current, page: value })),
    []
  );

  const setPageSize = useCallback(
    (value: number) => setState((current) => ({ ...current, pageSize: value, page: 1 })),
    []
  );

  return {
    ...state,
    isPending,
    setStatusTab,
    setSearch,
    togglePreacher,
    toggleSeries,
    setDateRange,
    clearDate,
    clearAll,
    handleSortChange,
    setPage,
    setPageSize
  };
}
