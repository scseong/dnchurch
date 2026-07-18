import type { Database } from '@/types/database.types';

export const NOTICE_BUCKET = 'notices';
export const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
export const DEFAULT_PAGE_SIZE = 10;

type NoticeCategoryEnum = Database['public']['Enums']['notice_category_enum'];

export const NOTICE_CATEGORIES: Record<NoticeCategoryEnum, string> = {
  예배: '예배',
  행사: '행사',
  교육: '교육',
  모집: '모집',
  교인소식: '교인소식',
  선교: '선교',
  행정: '행정',
  긴급: '긴급',
  기타: '기타'
} as const;

// UI에 노출하는 정렬만 둔다. validate.within(NOTICE_SORT_OPTIONS)이 이 목록으로 URL sort를 검증하므로,
// 노출하지 않는 값(예: oldest)을 남기면 ?sort=oldest가 숨은 필터로 통과한다 (PR #136 year 사례).
export const NOTICE_SORT_OPTIONS = {
  latest: '최신순',
  views: '조회순'
} as const;

export type NoticeSortOption = keyof typeof NOTICE_SORT_OPTIONS;

export const NEW_BADGE_DAYS = 7;
