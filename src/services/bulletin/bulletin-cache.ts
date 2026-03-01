import type { NextCacheOptions } from '@/types/common';

const ROOT = 'bulletin';

export const bulletinCache = {
  list: (): NextCacheOptions => ({
    tags: [ROOT, 'bulletin-list'],
    revalidate: 86400
  }),
  summary: (): NextCacheOptions => ({
    tags: [ROOT, 'bulletin-summary'],
    revalidate: 86400
  }),
  detail: (id: string | number): NextCacheOptions => ({
    tags: [ROOT, 'bulletin-detail', `bulletin-detail-${id}`]
  }),
  nav: (targetId: number): NextCacheOptions => ({
    tags: [ROOT, 'bulletin-nav', `bulletin-nav-${targetId}`]
  })
} as const;
