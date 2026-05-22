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

export type SermonRequiredField =
  | 'title'
  | 'sermonDate'
  | 'preacherId'
  | 'serviceType'
  | 'scripture'
  | 'videoId';

export const SERMON_REQUIRED_LABELS: Record<SermonRequiredField, string> = {
  title: '제목',
  sermonDate: '설교 날짜',
  preacherId: '설교자',
  serviceType: '예배 종류',
  scripture: '성경 구절',
  videoId: '영상 연결'
};

export const SERMON_REQUIRED_ORDER: readonly SermonRequiredField[] = [
  'title',
  'sermonDate',
  'preacherId',
  'serviceType',
  'scripture',
  'videoId'
] as const;

export function validateSermonForm(
  formData: SermonFormData
): { ok: boolean; missing: SermonRequiredField[] } {
  const missing: SermonRequiredField[] = [];
  if (formData.title.trim() === '') missing.push('title');
  if (formData.sermonDate === '') missing.push('sermonDate');
  if (formData.preacherId === '') missing.push('preacherId');
  if (formData.serviceType === '') missing.push('serviceType');
  if (formData.scripture.trim() === '') missing.push('scripture');
  if (formData.videoId === '') missing.push('videoId');
  return { ok: missing.length === 0, missing };
}
