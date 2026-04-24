import type { SermonFormData, SermonFormPatch } from '@/types/sermon-form';
import { parseVideoId } from './video-url';

export function applyPatch(
  current: SermonFormData,
  patch: SermonFormPatch
): SermonFormData {
  const next = { ...current, ...patch };
  const videoChanged =
    patch.videoUrl !== undefined || patch.videoProvider !== undefined;

  if (videoChanged) {
    next.videoId = parseVideoId(next.videoUrl, next.videoProvider);
  }

  if (videoChanged) {
    next.thumbnailUrl =
      next.videoProvider === 'youtube' && next.videoId
        ? `https://img.youtube.com/vi/${next.videoId}/hqdefault.jpg`
        : '';
  }

  return next;
}
