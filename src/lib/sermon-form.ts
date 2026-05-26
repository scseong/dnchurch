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

// 저장 가능 조건 — 비공개 초안 포함 모든 저장에 필요한 최소 4필드(DB NOT NULL 컬럼). 이 파일 안에서만 사용.
const SERMON_SAVE_REQUIRED: readonly SermonRequiredField[] = [
  'title',
  'sermonDate',
  'preacherId',
  'serviceType'
] as const;

function collectMissing(
  formData: SermonFormData,
  fields: readonly SermonRequiredField[]
): SermonRequiredField[] {
  const isEmpty: Record<SermonRequiredField, boolean> = {
    title: formData.title.trim() === '',
    sermonDate: formData.sermonDate === '',
    preacherId: formData.preacherId === '',
    serviceType: formData.serviceType === '',
    scripture: formData.scripture.trim() === '',
    videoId: formData.videoId === ''
  };
  return fields.filter((field) => isEmpty[field]);
}

// 저장 가능 조건 — 4필드만 확인. 영상·성경 구절 없이 비공개 초안 저장 허용.
export function validateSermonSave(
  formData: SermonFormData
): { ok: boolean; missing: SermonRequiredField[] } {
  const missing = collectMissing(formData, SERMON_SAVE_REQUIRED);
  return { ok: missing.length === 0, missing };
}

// 발행 가능 조건 — 공개(isPublished=true) 시 성경 구절·영상 연결까지 더한 6필드.
export function validateSermonPublishReady(
  formData: SermonFormData
): { ok: boolean; missing: SermonRequiredField[] } {
  const missing = collectMissing(formData, SERMON_REQUIRED_ORDER);
  return { ok: missing.length === 0, missing };
}
