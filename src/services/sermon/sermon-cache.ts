import type { NextCacheOptions } from '@/types/common';

const ROOT = 'sermon';

const ONE_HOUR_IN_SECONDS = 60 * 60;
const ONE_DAY_IN_SECONDS = 24 * ONE_HOUR_IN_SECONDS;

export const sermonCache = {
  list: (): NextCacheOptions => ({
    tags: [ROOT, 'sermon-list'],
    revalidate: ONE_DAY_IN_SECONDS
  }),
  detail: (id: number): NextCacheOptions => ({
    tags: [ROOT, 'sermon-detail', `sermon-detail-${id}`]
  }),
  seriesList: (): NextCacheOptions => ({
    tags: [ROOT, 'sermon-series-list'],
    revalidate: ONE_DAY_IN_SECONDS
  }),
  bySeries: (slug: string): NextCacheOptions => ({
    tags: [ROOT, 'sermon-list', `sermon-series-${slug}`],
    revalidate: ONE_DAY_IN_SECONDS
  }),
  preacherList: (): NextCacheOptions => ({
    tags: [ROOT, 'preacher-list'],
    revalidate: ONE_DAY_IN_SECONDS
  }),
  recent: (): NextCacheOptions => ({
    tags: [ROOT, 'sermon-list', 'sermon-recent'],
    revalidate: ONE_HOUR_IN_SECONDS
  })
} as const;
