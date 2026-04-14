import type { Sermon, SermonSeries } from '@/types/sermon';

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

export function groupSermonsByYear(
  sermons: Sermon[],
): Record<number, Sermon[]> {
  const grouped: Record<number, Sermon[]> = {};
  for (const sermon of sermons) {
    const year = new Date(sermon.sermon_date).getFullYear();
    (grouped[year] ??= []).push(sermon);
  }
  return grouped;
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
