import { NOTICE_CATEGORIES } from '@/constants/notice';
import { Tables } from '@/types/database.types';

export type NoticeType = Tables<'notices'>;
export type NoticeCategory = keyof typeof NOTICE_CATEGORIES;

export interface TipTapContent {
  type: 'doc';
  content: TipTapNode[];
}

export interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
}

export interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export type CreateNoticeDto = Pick<
  NoticeType,
  'title' | 'category' | 'content' | 'is_pinned' | 'is_published' | 'author'
>;

export type UpdateNoticeDto = Partial<CreateNoticeDto>;

export interface NoticeListParams {
  category?: NoticeCategory;
  page?: number;
  pageSize?: number;
  pinned?: boolean;
}
