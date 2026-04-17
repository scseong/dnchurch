import type { NextCacheOptions } from '@/types/common';

const ROOT = 'sermon';

export const sermonCache = {
  list: (): NextCacheOptions => ({
    tags: [ROOT, 'sermon-list'],
    revalidate: 86400
  }),
  detail: (slug: string): NextCacheOptions => ({
    tags: [ROOT, 'sermon-detail', `sermon-detail-${slug}`]
  }),
  seriesList: (): NextCacheOptions => ({
    tags: [ROOT, 'sermon-series-list'],
    revalidate: 86400
  }),
  bySeries: (slug: string): NextCacheOptions => ({
    tags: [ROOT, 'sermon-list', `sermon-series-${slug}`],
    revalidate: 86400
  }),
  preacherList: (): NextCacheOptions => ({
    tags: [ROOT, 'preacher-list'],
    revalidate: 86400
  }),
  recent: (): NextCacheOptions => ({
    tags: [ROOT, 'sermon-list', 'sermon-recent'],
    revalidate: 3600
  })
} as const;
