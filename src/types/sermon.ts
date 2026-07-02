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

/** 시리즈 회차 전용 — 회차 카드·사이드바가 읽는 스칼라만, 관계 join 없음 (P5) */
export type SeriesEpisodeItem = Pick<
  Sermon,
  | 'id'
  | 'series_order'
  | 'sermon_date'
  | 'video_id'
  | 'video_provider'
  | 'thumbnail_url'
  | 'title'
  | 'scripture'
  | 'duration'
>;

/** 공개·admin 소비처가 실제 읽는 필드 union — allSeries 셀렉트와 1:1 대조 유지 (P5) */
export type SeriesWithSermonCount = Pick<
  SermonSeries,
  'id' | 'slug' | 'title' | 'description' | 'cover_image_url' | 'started_at' | 'ended_at'
> & { sermon_count: number };

/** 시리즈 상세 페이지: 시리즈 단건 + 회차(설교) */
export type SeriesDetail = {
  series: SeriesWithSermonCount;
  episodes: SeriesEpisodeItem[];
};

/** 소비처가 실제 읽는 필드 union — allPreachers 셀렉트와 1:1 대조 유지 (P5) */
export type PreacherWithSermonCount = Pick<Preacher, 'id' | 'name' | 'title'> & {
  sermon_count: number;
};

export type SermonSortKey = 'recent' | 'oldest';

export interface SermonListParams {
  page?: number;
  pageSize?: number;
  seriesId?: string | '__none';
  preacherId?: string;
  serviceType?: ServiceType;
  year?: number;
  search?: string;
  sort?: SermonSortKey;
}

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
