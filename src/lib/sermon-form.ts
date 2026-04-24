import type { SermonFormData, SermonFormPatch } from '@/types/sermon-form';
import { parseVideoId } from './video-url';

export function applyPatch(
  current: SermonFormData,
  patch: SermonFormPatch
): SermonFormData {
  const next = { ...current, ...patch };

  if (patch.videoUrl !== undefined) {
    next.videoId = parseVideoId(next.videoUrl);
    next.thumbnailUrl = next.videoId
      ? `https://img.youtube.com/vi/${next.videoId}/hqdefault.jpg`
      : '';
  }

  return next;
}
