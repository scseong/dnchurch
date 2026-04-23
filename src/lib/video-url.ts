import type { VideoProvider } from '@/types/sermon-form';

const YOUTUBE_ID = /(?:v=|\/(?:embed|shorts|v)\/|youtu\.be\/)([A-Za-z0-9_-]{11})/;
const VIMEO_ID = /vimeo\.com(?:\/(?:video|channels\/[^/]+|groups\/[^/]+\/videos))?\/(\d+)/;
const RAW_YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const RAW_VIMEO_ID = /^\d+$/;

export function parseVideoId(url: string, provider: VideoProvider): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (provider === 'youtube') {
    if (RAW_YOUTUBE_ID.test(trimmed)) return trimmed;
    return trimmed.match(YOUTUBE_ID)?.[1] ?? '';
  }

  if (provider === 'vimeo') {
    if (RAW_VIMEO_ID.test(trimmed)) return trimmed;
    return trimmed.match(VIMEO_ID)?.[1] ?? '';
  }

  return '';
}
