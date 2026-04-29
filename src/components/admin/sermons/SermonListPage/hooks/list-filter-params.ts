import { NONE_SERIES_ID } from '@/lib/utils/sermon-filter';
import type {
  AdminSermonListParams,
  AdminSermonSortKey,
  AdminSermonSortState,
  SermonStatusTab
} from '@/types/sermon';

const STATUS_VALUES: SermonStatusTab[] = ['all', 'published', 'draft'];
const SORT_KEYS: AdminSermonSortKey[] = [
  'title',
  'sermon_date',
  'view_count',
  'updated_at'
];
const PAGE_SIZE_VALUES = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (value: string) => UUID_RE.test(value);

function parseIdList(raw: string | null, allowSentinel?: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .filter(Boolean)
    .filter((id) => (allowSentinel && id === allowSentinel) || isUuid(id));
}

/** URL searchParams → AdminSermonListParams. 서버/클라 양쪽에서 재사용 */
export function parseListFilterParams(
  params: URLSearchParams
): AdminSermonListParams {
  const status = params.get('status');
  const sortRaw = params.get('sort');
  let sort: AdminSermonSortState | null = null;
  if (sortRaw) {
    const [key, direction] = sortRaw.split(':');
    if (
      SORT_KEYS.includes(key as AdminSermonSortKey) &&
      (direction === 'asc' || direction === 'desc')
    ) {
      sort = { key: key as AdminSermonSortKey, direction };
    }
  }
  const pageRaw = Number(params.get('page'));
  const sizeRaw = Number(params.get('size'));
  return {
    statusTab: STATUS_VALUES.includes(status as SermonStatusTab)
      ? (status as SermonStatusTab)
      : 'all',
    search: params.get('search') ?? '',
    selectedPreachers: parseIdList(params.get('preachers')),
    selectedSeries: parseIdList(params.get('series'), NONE_SERIES_ID),
    dateFrom: params.get('from') ?? '',
    dateTo: params.get('to') ?? '',
    sort,
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: PAGE_SIZE_VALUES.includes(sizeRaw) ? sizeRaw : DEFAULT_PAGE_SIZE
  };
}

/** AdminSermonListParams → URL search string (디폴트값은 생략) */
export function buildListFilterQuery(state: AdminSermonListParams): string {
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
