export const NOTICE_BUCKET = 'notices';
export const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
export const DEFAULT_PAGE_SIZE = 10;

export const CATEGORY_STYLE: Record<NoticeCategory, { color: string; bg: string }> = {
  general: { color: '#4b5563', bg: '#f3f4f6' },
  worship: { color: '#6d28d9', bg: '#ede9fe' },
  event: { color: '#b45309', bg: '#fef3c7' },
  mission: { color: '#0369a1', bg: '#e0f2fe' },
  pastoral: { color: '#065f46', bg: '#d1fae5' },
  youth: { color: '#be185d', bg: '#fce7f3' }
};

type NoticeCategory = keyof typeof NOTICE_CATEGORIES;
export const NOTICE_CATEGORIES = {
  general: '일반',
  worship: '예배',
  event: '행사',
  mission: '선교',
  pastoral: '목회',
  youth: '청년'
} as const;
