import type { SermonResourceType } from '@/types/sermon-form';

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

export function inferResourceType(filename: string): SermonResourceType {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_MAP[ext] ?? 'link';
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
