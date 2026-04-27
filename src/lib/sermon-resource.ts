import type { SermonResourceType } from '@/types/sermon-form';

export const MAX_RESOURCE_BYTES = 50 * 1024 * 1024;

export const RESOURCE_BUCKET = 'sermon-resources';

const EXT_MAP: Record<string, SermonResourceType> = {
  pdf: 'pdf',
  hwp: 'hwp',
  txt: 'txt',
  mp3: 'audio',
  wav: 'audio',
  m4a: 'audio',
  mp4: 'video',
  mov: 'video',
  webm: 'video'
};

// 매핑되지 않는 확장자는 null을 반환 — 호출자가 업로드 거부로 처리.
// ('link'는 URL 첨부 전용 enum 값이므로 업로드 fallback으로 쓰지 않는다.)
export function inferResourceType(filename: string): SermonResourceType | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_MAP[ext] ?? null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/**
 * 공개 URL(`getPublicUrl` 결과)에서 storage 내부 path를 추출한다.
 * bucket이 private으로 전환된 후에도 file_url 컬럼은 동일 포맷을 유지하므로
 * signed URL 발급 시 path 추출용으로 사용.
 */
export function extractStoragePath(fileUrl: string): string | null {
  const marker = `/public/${RESOURCE_BUCKET}/`;
  const idx = fileUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(fileUrl.substring(idx + marker.length));
}
