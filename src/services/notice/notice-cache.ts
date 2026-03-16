import type { NextCacheOptions } from '@/types/common';

const ROOT = 'notice';

export const noticeCache = {
  list: (): NextCacheOptions => ({
    tags: [ROOT, 'notice-list'],
    revalidate: 300
  }),
  detail: (id: string | number): NextCacheOptions => ({
    tags: [ROOT, 'notice-detail', `notice-detail-${id}`]
  }),
  nav: (noticeId: number): NextCacheOptions => ({
    tags: [ROOT, 'notice-detail-nav', `notice-detail-nav-${noticeId}`]
  })
} as const;
