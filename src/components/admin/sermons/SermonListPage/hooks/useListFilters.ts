'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SermonStatusTab } from '@/lib/mocks/sermons-admin';
import type { SermonSortKey, SermonSortState } from '@/lib/utils/sermon-filter';

export interface ListFilterState {
  statusTab: SermonStatusTab;
  search: string;
  selectedPreachers: string[];
  selectedSeries: string[];
  dateFrom: string;
  dateTo: string;
  sort: SermonSortState | null;
  page: number;
  pageSize: number;
}

const STATUS_VALUES: SermonStatusTab[] = ['all', 'published', 'draft', 'scheduled'];
const SORT_KEYS: SermonSortKey[] = ['title', 'sermon_date', 'view_count', 'updated_at'];
const PAGE_SIZE_VALUES = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

function parseUrl(params: URLSearchParams): ListFilterState {
  const status = params.get('status');
  const sortRaw = params.get('sort');
  let sort: SermonSortState | null = null;
  if (sortRaw) {
    const [key, direction] = sortRaw.split(':');
    if (SORT_KEYS.includes(key as SermonSortKey) && (direction === 'asc' || direction === 'desc')) {
      sort = { key: key as SermonSortKey, direction };
    }
  }
  const pageRaw = Number(params.get('page'));
  const sizeRaw = Number(params.get('size'));
  return {
    statusTab: STATUS_VALUES.includes(status as SermonStatusTab)
      ? (status as SermonStatusTab)
      : 'all',
    search: params.get('search') ?? '',
    selectedPreachers: params.get('preachers')?.split(',').filter(Boolean) ?? [],
    selectedSeries: params.get('series')?.split(',').filter(Boolean) ?? [],
    dateFrom: params.get('from') ?? '',
    dateTo: params.get('to') ?? '',
    sort,
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: PAGE_SIZE_VALUES.includes(sizeRaw) ? sizeRaw : DEFAULT_PAGE_SIZE
  };
}

function buildQueryString(state: ListFilterState): string {
  const params = new URLSearchParams();
  if (state.statusTab !== 'all') params.set('status', state.statusTab);
  if (state.search) params.set('search', state.search);
  if (state.selectedPreachers.length > 0) {
    params.set('preachers', state.selectedPreachers.join(','));
  }
  if (state.selectedSeries.length > 0) {
    params.set('series', state.selectedSeries.join(','));
  }
  if (state.dateFrom) params.set('from', state.dateFrom);
  if (state.dateTo) params.set('to', state.dateTo);
  if (state.sort) params.set('sort', `${state.sort.key}:${state.sort.direction}`);
  if (state.page !== 1) params.set('page', String(state.page));
  if (state.pageSize !== DEFAULT_PAGE_SIZE) params.set('size', String(state.pageSize));
  return params.toString();
}

export function useListFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ListFilterState>(() =>
    parseUrl(new URLSearchParams(searchParams.toString()))
  );

  // URL 변경(뒤로가기/수동 입력) → state
  useEffect(() => {
    const fromUrl = parseUrl(new URLSearchParams(searchParams.toString()));
    setState((current) =>
      buildQueryString(current) === buildQueryString(fromUrl) ? current : fromUrl
    );
  }, [searchParams]);

  // state → URL
  useEffect(() => {
    const target = buildQueryString(state);
    if (target === searchParams.toString()) return;
    router.replace(target ? `?${target}` : '?', { scroll: false });
  }, [state, searchParams, router]);

  const setStatusTab = useCallback(
    (value: SermonStatusTab) => setState((current) => ({ ...current, statusTab: value, page: 1 })),
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
    (key: SermonSortKey) =>
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
