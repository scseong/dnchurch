import type {
  Sermon,
  Preacher,
  SeriesWithSermonCount,
  SermonListParams,
  SermonSortKey
} from '@/types/sermon';

export function hasVideo<T extends Pick<Sermon, 'video_id'>>(
  sermon: T,
): sermon is T & { video_id: string } {
  return typeof sermon.video_id === 'string' && sermon.video_id.length > 0;
}

export function getSermonThumbnail(
  sermon: Pick<Sermon, 'thumbnail_url' | 'video_id' | 'video_provider'>,
): string | null {
  if (sermon.thumbnail_url) return sermon.thumbnail_url;
  if (sermon.video_provider === 'youtube' && sermon.video_id) {
    return `https://img.youtube.com/vi/${sermon.video_id}/maxresdefault.jpg`;
  }
  return null;
}

export function formatSermonDuration(duration: string | null): string | null {
  if (!duration) return null;
  const match = duration.match(/^(\d{1,2}):(\d{2}):(\d{2})/);
  if (!match) return duration;
  const [, hh, mm, ss] = match;
  const hours = Number(hh);
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function computeStandaloneCount(
  totalCount: number,
  allSeries: SeriesWithSermonCount[],
): number {
  return Math.max(0, totalCount - allSeries.reduce((s, x) => s + x.sermon_count, 0));
}

/**
 * URL `series` 파라미터(slug 또는 'none')를 서비스 계약의 seriesId로 변환.
 * 유효하지 않은 slug는 원문을 그대로 반환 — DB 매칭 실패 → 빈 결과.
 */
export function resolveSeriesSlug(
  slug: string | undefined,
  allSeries: SeriesWithSermonCount[],
): SermonListParams['seriesId'] | undefined {
  if (!slug) return undefined;
  if (slug === 'none') return '__none';
  const found = allSeries.find((s) => s.slug === slug);
  return found?.id ?? slug;
}

/**
 * URL `preacher` 파라미터(name)를 서비스 계약의 preacherId(UUID)로 변환.
 */
export function resolvePreacherName(
  name: string | undefined,
  allPreachers: Preacher[],
): string | undefined {
  if (!name) return undefined;
  const found = allPreachers.find((preacher) => preacher.name === name);
  return found?.id;
}

/**
 * `preacher.title` DB 원문(예: "담임목사", "부목사", "전임전도사")을 직분 토큰(목사/전도사/강도사 등)으로 정규화.
 * 매핑 안 되는 값은 원문 그대로 (확장성 — 새 직분 도입 시 명시적 enum 추가 전까지 fallback).
 */
export function formatPreacherTitle(title: string | null | undefined): string {
  if (!title) return '';
  if (title.endsWith('전도사')) return '전도사';
  if (title.endsWith('목사')) return '목사';
  if (title.endsWith('강도사')) return '강도사';
  return title;
}

export function formatPreacherLabel(
  preacher: Pick<Preacher, 'name' | 'title'> | null,
): string {
  if (!preacher) return '';
  const role = formatPreacherTitle(preacher.title);
  return role ? `${preacher.name} ${role}` : preacher.name;
}

import { getString, getInt, buildFilterHref } from '@/utils/search-params';
import type { SearchParams } from '@/utils/search-params';

export type SermonFilterPatch = {
  series?: string | null;
  preacher?: string | null;
  q?: string | null;
  year?: string | null;
  sort?: SermonSortKey | null;
  page?: string | null;
};

export const SERMON_FILTER_KEYS = ['series', 'preacher', 'q', 'year'] as const;
// sort는 필터 reset에서 보존하기 위해 별도 추적 — buildSermonHref keys에는 포함, parseSermonParams에서 별도 검증
export const SERMON_URL_KEYS = [...SERMON_FILTER_KEYS, 'sort'] as const;

export function parseSermonParams(raw: SearchParams) {
  const [seriesKey, preacherKey, searchKey, yearKey] = SERMON_FILTER_KEYS;
  const rawSort = getString(raw, 'sort');

  return {
    series: getString(raw, seriesKey),
    preacher: getString(raw, preacherKey),
    search: getString(raw, searchKey),
    year: getInt(raw, yearKey, { min: 1900, max: 2100 }),
    sort: (rawSort === 'oldest' ? 'oldest' : 'recent') as SermonSortKey,
    page: getInt(raw, 'page', { min: 1 }) ?? 1,
  };
}

export const buildSermonHref = (
  params: SearchParams,
  patch: SermonFilterPatch = {},
): string => {
  const keys = 'page' in patch ? [...SERMON_URL_KEYS, 'page'] : SERMON_URL_KEYS;
  return buildFilterHref('/sermons/all', params, keys, patch);
};

// ── 모든 시리즈 페이지(/sermons/series) 필터 ──
// 설교자 축은 sermon_series에 preacher가 없어 제외 (후속 task). 정렬 고정이라 sort 없음.

export const SERIES_FILTER_KEYS = ['status', 'year', 'q'] as const;

export type SeriesStatusFilter = 'active' | 'ended';

export type SeriesFilterPatch = {
  status?: string | null;
  year?: string | null;
  q?: string | null;
};

// status 필터 옵션 (사이드바·BottomSheet 공용)
export const SERIES_STATUS_OPTIONS: {
  value: SeriesStatusFilter | null;
  label: string;
}[] = [
  { value: null, label: '전체' },
  { value: 'active', label: '진행 중' },
  { value: 'ended', label: '완료' }
];

const SERIES_YEAR_MIN = 1900;
const SERIES_YEAR_MAX = 2100;

export function parseSeriesParams(raw: SearchParams) {
  const rawStatus = getString(raw, 'status');
  return {
    status: (rawStatus === 'active' || rawStatus === 'ended'
      ? rawStatus
      : undefined) as SeriesStatusFilter | undefined,
    year: getInt(raw, 'year', { min: SERIES_YEAR_MIN, max: SERIES_YEAR_MAX }),
    q: getString(raw, 'q'),
  };
}

export const buildSeriesHref = (
  params: SearchParams,
  patch: SeriesFilterPatch = {},
): string => buildFilterHref('/sermons/series', params, SERIES_FILTER_KEYS, patch);

export function filterSeries(
  series: SeriesWithSermonCount[],
  filters: { status?: SeriesStatusFilter; year?: number; q?: string },
): SeriesWithSermonCount[] {
  const query = filters.q?.trim().toLowerCase();
  return series.filter((item) => {
    if (filters.status === 'active' && item.ended_at !== null) return false;
    if (filters.status === 'ended' && item.ended_at === null) return false;
    if (filters.year !== undefined && item.year !== filters.year) return false;
    if (query) {
      const haystack = `${item.title} ${item.description ?? ''}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

/** 결과셋에 존재하는 연도 옵션 (내림차순) */
export function getSeriesYearOptions(
  series: SeriesWithSermonCount[],
): number[] {
  const years = series
    .map((item) => item.year)
    .filter((year): year is number => year != null);
  return [...new Set(years)].sort((a, b) => b - a);
}

