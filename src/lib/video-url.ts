const YOUTUBE_ID = /(?:v=|\/(?:embed|shorts|v)\/|youtu\.be\/)([A-Za-z0-9_-]{11})/;
const RAW_YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function parseVideoId(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (RAW_YOUTUBE_ID.test(trimmed)) return trimmed;
  return trimmed.match(YOUTUBE_ID)?.[1] ?? '';
}
