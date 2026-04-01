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

export const CATEGORY_STYLE: Record<NoticeCategoryEnum, { color: string; bg: string }> = {
  예배: { color: '#6d28d9', bg: '#ede9fe' },
  행사: { color: '#b45309', bg: '#fef3c7' },
  교육: { color: '#0369a1', bg: '#e0f2fe' },
  모집: { color: '#065f46', bg: '#d1fae5' },
  교인소식: { color: '#be185d', bg: '#fce7f3' },
  선교: { color: '#1d4ed8', bg: '#dbeafe' },
  행정: { color: '#4b5563', bg: '#f3f4f6' },
  긴급: { color: '#dc2626', bg: '#fee2e2' },
  기타: { color: '#6b7280', bg: '#f3f4f6' }
};

export const NOTICE_SORT_OPTIONS = {
  latest: '최신순',
  oldest: '오래된순',
  views: '조회순'
} as const;

export type NoticeSortOption = keyof typeof NOTICE_SORT_OPTIONS;

export const NEW_BADGE_DAYS = 7;
