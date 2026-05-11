import type { NextCacheOptions } from '@/types/common';

const ROOT = 'worship-schedules';

export const worshipCache = {
  list: (): NextCacheOptions => ({
    tags: [ROOT, 'worship-schedules-list'],
    cache: 'force-cache'
  })
} as const;
