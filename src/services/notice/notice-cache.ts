import type { NextCacheOptions } from '@/types/common';

const ROOT = 'notice';

export const noticeCache = {
  list: (): NextCacheOptions => ({
    tags: [ROOT, 'notice-list'],
    revalidate: 300
  }),
  // force-cache라 태그 무효화가 없으면 무기한 캐시된다. 공지 뮤테이션이 앱에 없어 태그를 깰 경로가
  // 없으므로, 목록과 같은 시간 기반 revalidate를 둬 상세·이전다음 글이 낡은 채 남지 않게 한다.
  detail: (id: string | number): NextCacheOptions => ({
    tags: [ROOT, 'notice-detail', `notice-detail-${id}`],
    revalidate: 300
  }),
  nav: (noticeId: number): NextCacheOptions => ({
    tags: [ROOT, 'notice-detail-nav', `notice-detail-nav-${noticeId}`],
    revalidate: 300
  })
} as const;
