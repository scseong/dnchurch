import {
  deriveSermonStatus,
  type AdminSermon,
  type SermonStatusTab
} from '@/lib/mocks/sermons-admin';

export const NONE_SERIES_ID = '__none';

export type SermonSortKey = 'title' | 'sermon_date' | 'view_count' | 'updated_at';
export type SermonSortDirection = 'asc' | 'desc';

export interface SermonSortState {
  key: SermonSortKey;
  direction: SermonSortDirection;
}

export interface AdminSermonFilters {
  statusTab: SermonStatusTab;
  search: string;
  selectedPreachers: string[];
  selectedSeries: string[];
  dateFrom: string;
  dateTo: string;
}

export function matchStatusTab(
  sermon: AdminSermon,
  tab: SermonStatusTab,
  now: Date
): boolean {
  if (tab === 'all') return true;
  return deriveSermonStatus(sermon, now) === tab;
}

function matchSearch(sermon: AdminSermon, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  const haystack = [
    sermon.title,
    sermon.scripture ?? '',
    sermon.preacher.name
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(trimmed);
}

function matchPreacher(sermon: AdminSermon, selected: string[]): boolean {
  if (selected.length === 0) return true;
  return selected.includes(sermon.preacher.id);
}

function matchSeries(sermon: AdminSermon, selected: string[]): boolean {
  if (selected.length === 0) return true;
  if (sermon.sermon_series === null) return selected.includes(NONE_SERIES_ID);
  return selected.includes(sermon.sermon_series.id);
}

function matchDateRange(
  sermon: AdminSermon,
  dateFrom: string,
  dateTo: string
): boolean {
  if (dateFrom && sermon.sermon_date < dateFrom) return false;
  if (dateTo && sermon.sermon_date > dateTo) return false;
  return true;
}

export function filterSermons(
  sermons: AdminSermon[],
  filters: AdminSermonFilters,
  now: Date = new Date()
): AdminSermon[] {
  return sermons.filter(
    (sermon) =>
      matchStatusTab(sermon, filters.statusTab, now) &&
      matchSearch(sermon, filters.search) &&
      matchPreacher(sermon, filters.selectedPreachers) &&
      matchSeries(sermon, filters.selectedSeries) &&
      matchDateRange(sermon, filters.dateFrom, filters.dateTo)
  );
}

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

export function sortSermons(
  sermons: AdminSermon[],
  sort: SermonSortState | null
): AdminSermon[] {
  if (!sort) return sermons;
  const sorted = [...sermons].sort((a, b) => {
    const valueA = a[sort.key] ?? '';
    const valueB = b[sort.key] ?? '';
    return compareValues(valueA, valueB);
  });
  return sort.direction === 'asc' ? sorted : sorted.reverse();
}

export function countByStatus(
  sermons: AdminSermon[],
  now: Date = new Date()
): Record<SermonStatusTab, number> {
  const counts: Record<SermonStatusTab, number> = {
    all: sermons.length,
    published: 0,
    draft: 0,
    scheduled: 0
  };
  for (const sermon of sermons) {
    counts[deriveSermonStatus(sermon, now)] += 1;
  }
  return counts;
}
