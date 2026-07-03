import type { NextCacheOptions } from '@/types/common';

const ROOT = 'notice';

export const noticeCache = {
  list: (): NextCacheOptions => ({
    tags: [ROOT, 'notice-list'],
    revalidate: 300
  }),
  // 공지 상세는 드물게 바뀌고 in-app 뮤테이션이 아직 없다(외부에서 관리). force-cache라 태그를 깰
  // 경로가 없으면 무기한 캐시되므로, 하루 주기 시간 revalidate를 backstop으로 둔다. 향후 공지 CRUD가
  // 생기면 이 태그들을 updateTag로 무효화해 즉시 갱신하면 된다.
  detail: (id: string | number): NextCacheOptions => ({
    tags: [ROOT, 'notice-detail', `notice-detail-${id}`],
    revalidate: 86400
  }),
  nav: (noticeId: number): NextCacheOptions => ({
    tags: [ROOT, 'notice-detail-nav', `notice-detail-nav-${noticeId}`],
    revalidate: 86400
  })
} as const;
