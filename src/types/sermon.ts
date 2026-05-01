import type { Tables, Database } from '@/types/database.types';

export type Sermon = Tables<'sermons'>;
export type SermonSeries = Tables<'sermon_series'>;
export type Preacher = Tables<'preachers'>;
export type SermonResource = Tables<'sermon_resources'>;

export type ServiceType = Database['public']['Enums']['service_type_enum'];
export type SermonResourceType = Database['public']['Enums']['sermon_resource_type'];

export type SermonWithRelations = Sermon & {
  preacher: Preacher | null;
  sermon_series: SermonSeries | null;
  sermon_resources: SermonResource[];
};

export type SermonListItem = Pick<
  Sermon,
  | 'id'
  | 'slug'
  | 'sermon_date'
  | 'video_id'
  | 'video_provider'
  | 'thumbnail_url'
  | 'title'
  | 'scripture'
  | 'service_type'
> & { preacher: Pick<Preacher, 'name' | 'title'> | null };

export type SermonCardItem = SermonListItem &
  Pick<Sermon, 'summary' | 'duration'> & {
    sermon_series: Pick<SermonSeries, 'id' | 'slug' | 'title'> | null;
  };

export type SeriesWithSermonCount = SermonSeries & { sermon_count: number };

export interface SermonListParams {
  page?: number;
  pageSize?: number;
  seriesId?: string | '__none';
  preacherId?: string;
  serviceType?: ServiceType;
  year?: number;
  search?: string;
}

export type YearCount = {
  year: number;
  count: number;
};

export type SermonArchiveView = {
  featured: SermonWithRelations | null;
  recentSermons: SermonWithRelations[];
  yearCounts: YearCount[];
};

// ─── Admin: 발행 상태 + 목록 응답 타입 ───────────────────────────────────────

export type SermonStatus = 'published' | 'draft';
export type SermonStatusTab = 'all' | SermonStatus;

export const SERMON_STATUS_LABEL: Record<SermonStatus, string> = {
  published: '발행',
  draft: '초안'
};

export type AdminSermon = Sermon & {
  preacher: Pick<Preacher, 'id' | 'name'>;
  sermon_series: Pick<SermonSeries, 'id' | 'title'> | null;
};

export type AdminSermonSortKey =
  | 'title'
  | 'sermon_date'
  | 'view_count'
  | 'updated_at';

export interface AdminSermonSortState {
  key: AdminSermonSortKey;
  direction: 'asc' | 'desc';
}

export interface AdminSermonListParams {
  statusTab: SermonStatusTab;
  search: string;
  selectedPreachers: string[];
  selectedSeries: string[];
  dateFrom: string;
  dateTo: string;
  sort: AdminSermonSortState | null;
  page: number;
  pageSize: number;
}

export interface AdminSermonListResult {
  sermons: AdminSermon[];
  total: number;
  statusCounts: Record<SermonStatusTab, number>;
}

export function deriveSermonStatus(
  sermon: Pick<Sermon, 'is_published'>
): SermonStatus {
  return sermon.is_published ? 'published' : 'draft';
}
