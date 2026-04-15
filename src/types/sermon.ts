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
> & { preacher: Pick<Preacher, 'name'> | null };

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
