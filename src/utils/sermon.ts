import type {
  Sermon,
  Preacher,
  SermonSeries,
  SermonWithRelations,
  SermonArchiveView,
  SeriesWithSermonCount,
  SermonListParams,
  YearCount
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

export function groupSeriesByYear<T extends SermonSeries>(
  series: T[],
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  for (const item of series) {
    const key = item.year === null ? '미분류' : String(item.year);
    (grouped[key] ??= []).push(item);
  }
  return grouped;
}

export function getSeriesByYearEntries<T extends SermonSeries>(
  series: T[],
): Array<readonly [string, T[]]> {
  const grouped = groupSeriesByYear(series);
  return Object.entries(grouped).sort(([a], [b]) => {
    if (a === '미분류') return 1;
    if (b === '미분류') return -1;
    return Number(b) - Number(a);
  });
}

export function buildSermonArchive(
  sermons: SermonWithRelations[],
  yearCounts: YearCount[],
): SermonArchiveView {
  const [featured = null, ...rest] = sermons;
  return { featured, recentSermons: rest, yearCounts };
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

export function formatPreacherLabel(
  preacher: Pick<Preacher, 'name' | 'title'> | null,
): string {
  if (!preacher) return '';
  return preacher.title ? `${preacher.name} ${preacher.title}` : preacher.name;
}

import { getString, getInt, buildFilterHref } from '@/utils/search-params';
import type { SearchParams } from '@/utils/search-params';

export type SermonFilterPatch = {
  series?: string | null;
  preacher?: string | null;
  q?: string | null;
  year?: string | null;
};

export const SERMON_FILTER_KEYS = ['series', 'preacher', 'q', 'year'] as const satisfies readonly (keyof SermonFilterPatch)[];

export function parseSermonParams(raw: SearchParams) {
  const [seriesKey, preacherKey, searchKey, yearKey] = SERMON_FILTER_KEYS;

  return {
    series: getString(raw, seriesKey),
    preacher: getString(raw, preacherKey),
    search: getString(raw, searchKey),
    year: getInt(raw, yearKey, { min: 1900, max: 2100 }),
  };
}

export const buildSermonHref = (
  params: SearchParams,
  patch: SermonFilterPatch = {},
): string => buildFilterHref('/sermons', params, SERMON_FILTER_KEYS, patch);

