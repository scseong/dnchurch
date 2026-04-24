import type { Database } from '@/types/database.types';
import type { SermonFormData } from '@/types/sermon-form';
import type { SermonWithRelations } from '@/types/sermon';

export type SermonDbInsert = Database['public']['Tables']['sermons']['Insert'];
export type SermonDbUpdate = Database['public']['Tables']['sermons']['Update'];

export function mapFormToDbInsert(
  data: SermonFormData
): Omit<SermonDbInsert, 'slug' | 'series_order'> {
  return {
    title: data.title,
    sermon_date: data.sermonDate,
    preacher_id: data.preacherId,
    series_id: data.seriesId || null,
    service_type: data.serviceType as SermonDbInsert['service_type'],
    video_provider: data.videoProvider,
    video_id: data.videoId || null,
    thumbnail_url: data.thumbnailUrl || null,
    duration: data.duration || null,
    scripture: data.scripture || null,
    scripture_text: data.scriptureText || null,
    summary: data.summary || null,
    is_published: data.isPublished
  };
}

export function mapFormToDbUpdate(
  data: SermonFormData
): Omit<SermonDbUpdate, 'slug' | 'series_order' | 'id' | 'created_at'> {
  return {
    title: data.title,
    sermon_date: data.sermonDate,
    preacher_id: data.preacherId,
    series_id: data.seriesId || null,
    service_type: data.serviceType as SermonDbInsert['service_type'],
    video_provider: data.videoProvider,
    video_id: data.videoId || null,
    thumbnail_url: data.thumbnailUrl || null,
    duration: data.duration || null,
    scripture: data.scripture || null,
    scripture_text: data.scriptureText || null,
    summary: data.summary || null,
    is_published: data.isPublished
  };
}

export function mapSermonToFormData(sermon: SermonWithRelations): SermonFormData {
  return {
    title: sermon.title,
    sermonDate: sermon.sermon_date,
    preacherId: sermon.preacher_id,
    seriesId: sermon.series_id ?? '',
    serviceType: sermon.service_type,
    videoProvider: (sermon.video_provider as SermonFormData['videoProvider']) ?? 'youtube',
    videoUrl: '',
    videoId: sermon.video_id ?? '',
    duration: sermon.duration ?? '',
    thumbnailUrl: sermon.thumbnail_url ?? '',
    thumbnailManual: !!sermon.thumbnail_url,
    scripture: sermon.scripture ?? '',
    scriptureText: sermon.scripture_text ?? '',
    summary: sermon.summary ?? '',
    resources: sermon.sermon_resources
      .filter((r) => !r.deleted_at)
      .map((r) => ({
        id: r.id,
        name: r.title,
        size: r.file_size_bytes ?? 0,
        fileType: r.file_type ?? 'pdf',
        url: r.file_url
      })),
    isPublished: sermon.is_published
  };
}
